"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AgentEvent,
  Call,
  CallTranscriptEntry,
  GeneratedWebsite,
  Offer,
  Prospect,
  RevenueLoopState,
} from "@/lib/types";
import { calculateMetrics } from "@/lib/revenue";
import {
  createInitialState,
  createResearchForProspect,
  createSalesStrategyForProspect,
  createScoreForProspect,
  createWebsiteForProspect,
  seededProspects,
} from "@/lib/seed";
import { assertCanPlaceCall, transitionAgentState } from "@/lib/agent/state-machine";
import { nowIso } from "@/lib/utils";
import type { DiscoveryRequest } from "@/lib/validation/discovery";

const STORAGE_KEY = "revenueloop-state-v1";

type DiscoveryInput = DiscoveryRequest;

interface DiscoveryResponse {
  ok: boolean;
  providerMode: "mock" | "live" | "free";
  providerName?: string;
  prospects?: Prospect[];
  logs?: string[];
  cost?: number;
  error?: string;
}

interface RevenueLoopContextValue {
  state: RevenueLoopState;
  metrics: ReturnType<typeof calculateMetrics>;
  resetDemo: () => void;
  runDemo: (speed?: number) => Promise<void>;
  pauseAgent: () => void;
  discoverProspects: (input: DiscoveryInput) => Promise<void>;
  generateWebsite: (prospectId: string) => void;
  approveCall: (prospectId: string) => Promise<void>;
  markDoNotContact: (prospectId: string, reason: string) => void;
  updateWebsiteSection: (
    websiteId: string,
    sectionId: string,
    body: string,
  ) => void;
  updateWebsiteTheme: (websiteId: string, style: GeneratedWebsite["theme"]["style"]) => void;
  publishWebsite: (websiteId: string) => void;
  selectProspect: (prospectId: string) => void;
}

const RevenueLoopContext = createContext<RevenueLoopContextValue | undefined>(
  undefined,
);

function cloneState(state: RevenueLoopState): RevenueLoopState {
  return JSON.parse(JSON.stringify(state)) as RevenueLoopState;
}

function createEvent(input: Partial<AgentEvent> & Pick<AgentEvent, "title" | "newState">): AgentEvent {
  return {
    id: `event-${crypto.randomUUID()}`,
    timestamp: nowIso(),
    status: "complete",
    inputSummary: "No input summary recorded.",
    outputSummary: "No output summary recorded.",
    estimatedCost: 0,
    retryStatus: "not_needed",
    ...input,
  };
}

function pushEvent(state: RevenueLoopState, event: AgentEvent) {
  state.events = [event, ...state.events].slice(0, 80);
  if (event.estimatedCost > 0) {
    state.costs = [
      {
        id: `cost-${crypto.randomUUID()}`,
        provider: event.title.includes("call") ? "ElevenLabs" : "Agent",
        action: event.title,
        amount: event.estimatedCost,
        prospectId: event.prospectId,
        createdAt: event.timestamp,
      },
      ...state.costs,
    ];
  }
  state.lastUpdatedAt = nowIso();
}

function updateProspect(
  state: RevenueLoopState,
  prospectId: string,
  patch: Partial<Prospect>,
) {
  state.prospects = state.prospects.map((prospect) =>
    prospect.id === prospectId
      ? { ...prospect, ...patch, updatedAt: nowIso() }
      : prospect,
  );
}

function upsertWebsite(state: RevenueLoopState, website: GeneratedWebsite) {
  const existingIndex = state.websites.findIndex((item) => item.id === website.id);
  if (existingIndex >= 0) {
    state.websites[existingIndex] = website;
  } else {
    state.websites = [website, ...state.websites];
  }
}

function upsertCall(state: RevenueLoopState, call: Call) {
  const existingIndex = state.calls.findIndex((item) => item.id === call.id);
  if (existingIndex >= 0) {
    state.calls[existingIndex] = call;
  } else {
    state.calls = [call, ...state.calls];
  }
}

function makeTranscript(callId: string, prospect: Prospect): CallTranscriptEntry[] {
  const timestamp = nowIso();
  return [
    {
      id: `${callId}-system`,
      callId,
      speaker: "system",
      text: "Simulation. No real outbound call was placed.",
      timestamp,
    },
    {
      id: `${callId}-ai-1`,
      callId,
      speaker: "ai",
      text: `Hi, this is RevenueLoop's AI assistant. I prepared a private website preview for ${prospect.name}. Do you have 30 seconds?`,
      timestamp,
      sentiment: "neutral",
    },
    {
      id: `${callId}-owner-1`,
      callId,
      speaker: "owner",
      text: "A website preview? We do not have a proper site right now. What did you make?",
      timestamp,
      sentiment: "positive",
    },
    {
      id: `${callId}-ai-2`,
      callId,
      speaker: "ai",
      text: "It is a mobile-first page with your services, location, review signals and a WhatsApp enquiry button. It only uses public details plus placeholders for you to approve.",
      timestamp,
      sentiment: "positive",
    },
    {
      id: `${callId}-owner-2`,
      callId,
      speaker: "owner",
      text: "Sounds useful. How much would it cost to activate?",
      timestamp,
      sentiment: "positive",
    },
    {
      id: `${callId}-ai-3`,
      callId,
      speaker: "ai",
      text: `The setup is S$${prospect.estimatedDealValue}, then S$79 per month for hosting and light edits. I can send the preview and checkout link for approval.`,
      timestamp,
      sentiment: "neutral",
    },
    {
      id: `${callId}-owner-3`,
      callId,
      speaker: "owner",
      text: "Send it over. If the page looks like what you described, we can try it this week.",
      timestamp,
      sentiment: "positive",
    },
  ];
}

function createCall(prospect: Prospect): Call {
  return {
    id: `call-${prospect.id}`,
    prospectId: prospect.id,
    status: "Calling",
    durationSeconds: 0,
    sentiment: "neutral",
    detectedObjections: [],
    priceDiscussed: prospect.estimatedDealValue,
    nextAction: "Stream simulated transcript.",
    simulation: true,
    startedAt: nowIso(),
  };
}

function completeCall(call: Call): Call {
  return {
    ...call,
    status: "Completed",
    durationSeconds: 142,
    sentiment: "positive",
    detectedObjections: ["Asked about activation price", "Wanted preview link"],
    nextAction: "Generate checkout link and send preview.",
    outcome: "Owner expressed interest and requested the checkout link.",
    completedAt: nowIso(),
  };
}

export function RevenueLoopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RevenueLoopState>(() => createInitialState());
  const stateRef = useRef(state);
  const storageReadyRef = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      let nextState = createInitialState();
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          nextState = JSON.parse(stored) as RevenueLoopState;
        }
      } catch {
        nextState = createInitialState();
      }
      storageReadyRef.current = true;
      setState(nextState);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (!storageReadyRef.current) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const mutate = useCallback((recipe: (draft: RevenueLoopState) => void) => {
    setState((previous) => {
      const draft = cloneState(previous);
      recipe(draft);
      draft.lastUpdatedAt = nowIso();
      return draft;
    });
  }, []);

  const resetDemo = useCallback(() => {
    setState(createInitialState());
  }, []);

  const selectProspect = useCallback(
    (prospectId: string) => mutate((draft) => void (draft.selectedProspectId = prospectId)),
    [mutate],
  );

  const pauseAgent = useCallback(() => {
    mutate((draft) => {
      draft.agentStatus = "Paused";
      draft.runningDemo = false;
      pushEvent(
        draft,
        createEvent({
          title: "Agent paused",
          status: "pending",
          previousState: draft.runs[0]?.currentState,
          newState: "PAUSED",
          inputSummary: "Operator pressed Pause Agent.",
          outputSummary: "No external action will run while paused.",
        }),
      );
    });
  }, [mutate]);

  const discoverProspects = useCallback(
    async (input: DiscoveryInput) => {
      mutate((draft) => {
        draft.agentStatus = "Running";
        pushEvent(
          draft,
          createEvent({
            title: "Scanning Singapore businesses",
            status: "running",
            newState: "DISCOVERING",
            inputSummary: `${input.category} around ${input.location || "Singapore"}.`,
            outputSummary: "Prospect Finder Agent is querying the configured search provider.",
          }),
        );
      });

      try {
        const response = await fetch("/api/prospects/discover", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(input),
        });
        const payload = (await response.json()) as DiscoveryResponse;

        if (!response.ok || !payload.ok || !payload.prospects) {
          throw new Error(payload.error ?? "Prospect discovery failed.");
        }

        const discoveredProspects = payload.prospects;
        const discoverySummary =
          payload.logs?.join(" ") ??
          `${discoveredProspects.length} prospects returned by the search provider.`;
        const providerSummary = `${payload.providerName ?? "Search provider"}: ${discoverySummary}`;

        mutate((draft) => {
          draft.prospects = discoveredProspects;
          draft.selectedProspectId = discoveredProspects[0]?.id;
          draft.settings.mode = payload.providerMode === "mock" ? "mock" : "live";
          draft.settings.discoveryProvider =
            payload.providerName === "Google Places"
              ? "google"
              : payload.providerName === "OpenStreetMap Overpass"
                ? "overpass"
                : "mock";
          draft.agentStatus = "Running";
          pushEvent(
            draft,
            createEvent({
              title: "Prospects discovered",
              status: "complete",
              newState: "DISCOVERING",
              inputSummary: `${input.category} around ${input.location || "Singapore"}.`,
              outputSummary: providerSummary,
              estimatedCost: payload.cost ?? 0,
            }),
          );
        });
      } catch (error) {
        mutate((draft) => {
          draft.agentStatus = "Idle";
          pushEvent(
            draft,
            createEvent({
              title: "Prospect discovery failed",
              status: "failed",
              newState: "FAILED",
              inputSummary: `${input.category} around ${input.location || "Singapore"}.`,
              outputSummary:
                error instanceof Error
                  ? error.message
                  : "Prospect Finder Agent failed.",
              error: error instanceof Error ? error.message : "Unknown error",
              retryStatus: "failed",
            }),
          );
        });
        throw error;
      }
    },
    [mutate],
  );

  const generateWebsite = useCallback(
    (prospectId: string) => {
      mutate((draft) => {
        const prospect = draft.prospects.find((item) => item.id === prospectId);
        if (!prospect) return;

        const research = createResearchForProspect(prospect);
        const score = createScoreForProspect(prospect);
        const website = createWebsiteForProspect(
          prospect,
          draft.websites.map((item) => item.slug),
        );
        const strategy = createSalesStrategyForProspect(prospect);

        draft.research = [
          research,
          ...draft.research.filter((item) => item.prospectId !== prospectId),
        ];
        draft.scores = [
          score,
          ...draft.scores.filter((item) => item.prospectId !== prospectId),
        ];
        upsertWebsite(draft, website);
        draft.strategies = [
          strategy,
          ...draft.strategies.filter((item) => item.prospectId !== prospectId),
        ];
        updateProspect(draft, prospectId, {
          status: "Ready to Contact",
          agentState: "AWAITING_APPROVAL",
          generatedWebsiteId: website.id,
          salesStrategyId: strategy.id,
        });
        draft.agentStatus = "Awaiting Approval";
        pushEvent(
          draft,
          createEvent({
            title: "Website generated",
            status: "approval",
            prospectId,
            previousState: "GENERATING_SITE",
            newState: "AWAITING_APPROVAL",
            inputSummary: "Public listing data and opportunity score.",
            outputSummary: "Preview site, sales strategy and approval gate are ready.",
            estimatedCost: 0.29,
          }),
        );
      });
    },
    [mutate],
  );

  const approveCall = useCallback(
    async (prospectId: string) => {
      const prospect = stateRef.current.prospects.find((item) => item.id === prospectId);
      if (!prospect) return;

      mutate((draft) => {
        updateProspect(draft, prospectId, {
          approvedForCall: true,
          agentState: "AWAITING_APPROVAL",
          status: "Call Scheduled",
        });
        pushEvent(
          draft,
          createEvent({
            title: "Human approval granted",
            status: "complete",
            prospectId,
            previousState: "AWAITING_APPROVAL",
            newState: "CALLING",
            inputSummary: "Operator approved the simulated voice call.",
            outputSummary: "The call can begin. Live mode would require explicit confirmation here.",
          }),
        );
      });

      await new Promise((resolve) => setTimeout(resolve, 250));

      const approvedProspect = {
        ...prospect,
        approvedForCall: true,
        agentState: "AWAITING_APPROVAL" as const,
      };
      assertCanPlaceCall(approvedProspect);
      const call = createCall(approvedProspect);
      const transcript = makeTranscript(call.id, approvedProspect);

      mutate((draft) => {
        upsertCall(draft, call);
        updateProspect(draft, prospectId, {
          callId: call.id,
          agentState: "CALLING",
          status: "Negotiating",
        });
        draft.agentStatus = "Running";
        pushEvent(
          draft,
          createEvent({
            title: "AI call started",
            status: "running",
            prospectId,
            previousState: "AWAITING_APPROVAL",
            newState: "CALLING",
            inputSummary: "Approved sales strategy and mock voice provider.",
            outputSummary: "Streaming simulated transcript.",
            estimatedCost: 0.42,
          }),
        );
      });

      for (const entry of transcript) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        mutate((draft) => {
          if (!draft.transcripts.some((item) => item.id === entry.id)) {
            draft.transcripts = [...draft.transcripts, { ...entry, timestamp: nowIso() }];
          }
        });
      }

      mutate((draft) => {
        upsertCall(draft, completeCall(call));
        updateProspect(draft, prospectId, {
          agentState: "PAYMENT_PENDING",
          status: "Negotiating",
        });
        pushEvent(
          draft,
          createEvent({
            title: "Owner expressed interest",
            status: "complete",
            prospectId,
            previousState: "CALLING",
            newState: "PAYMENT_PENDING",
            inputSummary: "Simulated transcript completed.",
            outputSummary: "Prospect requested the preview and checkout link.",
          }),
        );
      });
    },
    [mutate],
  );

  const markDoNotContact = useCallback(
    (prospectId: string, reason: string) => {
      mutate((draft) => {
        updateProspect(draft, prospectId, {
          doNotContact: true,
          agentState: "DO_NOT_CONTACT",
          status: "Rejected",
        });
        draft.doNotContactEntries = [
          {
            id: `dnc-${crypto.randomUUID()}`,
            prospectId,
            reason,
            createdAt: nowIso(),
          },
          ...draft.doNotContactEntries,
        ];
        pushEvent(
          draft,
          createEvent({
            title: "Do Not Contact honoured",
            status: "complete",
            prospectId,
            previousState: "AWAITING_APPROVAL",
            newState: "DO_NOT_CONTACT",
            inputSummary: reason,
            outputSummary: "All outbound actions are blocked for this prospect.",
          }),
        );
      });
    },
    [mutate],
  );

  const updateWebsiteSection = useCallback(
    (websiteId: string, sectionId: string, body: string) => {
      mutate((draft) => {
        draft.websites = draft.websites.map((website) =>
          website.id === websiteId
            ? {
                ...website,
                updatedAt: nowIso(),
                sections: website.sections.map((section) =>
                  section.id === sectionId ? { ...section, body } : section,
                ),
              }
            : website,
        );
      });
    },
    [mutate],
  );

  const updateWebsiteTheme = useCallback(
    (websiteId: string, style: GeneratedWebsite["theme"]["style"]) => {
      const accent = style === "emerald" ? "#39ff88" : style === "indigo" ? "#7c8cff" : "#ffc857";
      mutate((draft) => {
        draft.websites = draft.websites.map((website) =>
          website.id === websiteId
            ? { ...website, theme: { accent, style }, updatedAt: nowIso() }
            : website,
        );
      });
    },
    [mutate],
  );

  const publishWebsite = useCallback(
    (websiteId: string) => {
      mutate((draft) => {
        draft.websites = draft.websites.map((website) =>
          website.id === websiteId
            ? { ...website, published: true, updatedAt: nowIso() }
            : website,
        );
        const website = draft.websites.find((item) => item.id === websiteId);
        pushEvent(
          draft,
          createEvent({
            title: "Demo site published",
            status: "complete",
            prospectId: website?.prospectId,
            previousState: "AWAITING_APPROVAL",
            newState: "AWAITING_APPROVAL",
            inputSummary: "Operator published the preview site in demo mode.",
            outputSummary: website ? `/sites/${website.slug}` : "Preview URL unavailable.",
          }),
        );
      });
    },
    [mutate],
  );

  const runDemo = useCallback(
    async (speed = stateRef.current.settings.demoSpeed) => {
      if (stateRef.current.runningDemo) return;

      setState({
        ...createInitialState(),
        runningDemo: true,
        agentStatus: "Running",
        settings: { ...createInitialState().settings, demoSpeed: speed },
      });

      const target = seededProspects[0];
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, Math.max(120, ms / speed)));
      const addStep = async (
        event: Partial<AgentEvent> & Pick<AgentEvent, "title" | "newState">,
        recipe?: (draft: RevenueLoopState) => void,
        ms = 4000,
      ) => {
        mutate((draft) => {
          recipe?.(draft);
          pushEvent(draft, createEvent(event));
        });
        await wait(ms);
      };

      await addStep(
        {
          title: "Scanning Singapore businesses",
          status: "running",
          newState: "DISCOVERING",
          inputSummary: "Category sweep across salons, cafes, tutors and repair shops.",
          outputSummary: "Found businesses with weak or missing website signals.",
          estimatedCost: 0.04,
        },
        undefined,
        6500,
      );

      await addStep(
        {
          title: "Prospect discovered",
          status: "complete",
          prospectId: target.id,
          previousState: "DISCOVERING",
          newState: "RESEARCHING",
          inputSummary: "Mock Places result matched high rating and no website.",
          outputSummary: `${target.name} selected as the highest-value lead.`,
        },
        (draft) => {
          draft.selectedProspectId = target.id;
          updateProspect(draft, target.id, {
            status: "Qualified",
            agentState: transitionAgentState("DISCOVERING", "RESEARCHING"),
          });
        },
      );

      const research = createResearchForProspect(target);
      await addStep(
        {
          title: "Online presence analysed",
          status: "complete",
          prospectId: target.id,
          previousState: "RESEARCHING",
          newState: "SCORING",
          inputSummary: "Listing fields, social presence and conversion path.",
          outputSummary: research.digitalPresenceAnalysis,
          estimatedCost: 0.08,
        },
        (draft) => {
          draft.research = [research];
          updateProspect(draft, target.id, {
            agentState: transitionAgentState("RESEARCHING", "SCORING"),
          });
        },
      );

      const score = createScoreForProspect(target);
      await addStep(
        {
          title: "Opportunity score calculated",
          status: "complete",
          prospectId: target.id,
          previousState: "SCORING",
          newState: "GENERATING_SITE",
          inputSummary: "Website gap, demand signal, reachability and booking value.",
          outputSummary: `${score.score}/100. ${score.explanation}`,
          estimatedCost: 0.03,
        },
        (draft) => {
          draft.scores = [score];
          updateProspect(draft, target.id, {
            opportunityScore: score.score,
            agentState: transitionAgentState("SCORING", "GENERATING_SITE"),
          });
        },
      );

      const website = createWebsiteForProspect(target);
      await addStep(
        {
          title: "Website generated",
          status: "complete",
          prospectId: target.id,
          previousState: "GENERATING_SITE",
          newState: "PREPARING_PITCH",
          inputSummary: "Public facts and editable placeholders.",
          outputSummary: `Preview generated at /sites/${website.slug}.`,
          estimatedCost: 0.18,
        },
        (draft) => {
          upsertWebsite(draft, website);
          updateProspect(draft, target.id, {
            generatedWebsiteId: website.id,
            status: "Website Generated",
            agentState: transitionAgentState("GENERATING_SITE", "PREPARING_PITCH"),
          });
        },
        7000,
      );

      const strategy = createSalesStrategyForProspect(target);
      await addStep(
        {
          title: "Sales strategy prepared",
          status: "complete",
          prospectId: target.id,
          previousState: "PREPARING_PITCH",
          newState: "AWAITING_APPROVAL",
          inputSummary: "Generated opening, value proposition and objection handling.",
          outputSummary: `Approval required before simulated ElevenLabs call. Conversion estimate ${Math.round(strategy.conversionProbability * 100)}%.`,
          estimatedCost: 0.11,
        },
        (draft) => {
          draft.strategies = [strategy];
          draft.agentStatus = "Awaiting Approval";
          updateProspect(draft, target.id, {
            salesStrategyId: strategy.id,
            status: "Ready to Contact",
            agentState: transitionAgentState("PREPARING_PITCH", "AWAITING_APPROVAL"),
          });
        },
        7000,
      );

      await addStep(
        {
          title: "Human approval requested",
          status: "approval",
          prospectId: target.id,
          previousState: "PREPARING_PITCH",
          newState: "AWAITING_APPROVAL",
          inputSummary: "External action gate reached.",
          outputSummary: "Demo operator approves the call after reviewing the pitch.",
        },
        undefined,
        5000,
      );

      await approveCall(target.id);
      await wait(3500);

      const offer: Offer = {
        id: `offer-${target.id}`,
        prospectId: target.id,
        packageName: strategy.packageName,
        setupAmount: strategy.proposedPrice,
        monthlyAmount: strategy.monthlyPrice,
        status: "Accepted",
        createdAt: nowIso(),
      };
      const payment = {
        id: `payment-${target.id}`,
        prospectId: target.id,
        offerId: offer.id,
        amount: offer.setupAmount,
        currency: "SGD" as const,
        checkoutUrl: `/mock-checkout/${offer.id}`,
        status: "Paid" as const,
        provider: "mock" as const,
        createdAt: nowIso(),
        paidAt: nowIso(),
      };

      await addStep(
        {
          title: "Checkout link generated",
          status: "complete",
          prospectId: target.id,
          previousState: "FOLLOWING_UP",
          newState: "PAYMENT_PENDING",
          inputSummary: "Accepted Launch Site Sprint offer.",
          outputSummary: "Mock Stripe Checkout link created. No card data stored.",
          estimatedCost: 0.06,
        },
        (draft) => {
          draft.offers = [offer];
          draft.payments = [{ ...payment, status: "Pending", paidAt: undefined }];
          updateProspect(draft, target.id, {
            paymentId: payment.id,
            status: "Negotiating",
            agentState: "PAYMENT_PENDING",
          });
        },
        5500,
      );

      await addStep(
        {
          title: "Payment received",
          status: "complete",
          prospectId: target.id,
          previousState: "PAYMENT_PENDING",
          newState: "WON",
          inputSummary: "Mock Stripe webhook confirmed payment.",
          outputSummary: `S$${payment.amount} setup revenue booked and profit updated.`,
        },
        (draft) => {
          draft.payments = [payment];
          updateProspect(draft, target.id, {
            status: "Won",
            agentState: transitionAgentState("PAYMENT_PENDING", "WON"),
          });
        },
        5000,
      );

      await addStep(
        {
          title: "Next cycle funded",
          status: "complete",
          newState: "DISCOVERING",
          inputSummary: "Profit allocation engine calculated next-cycle budget.",
          outputSummary:
            "RevenueLoop can reinvest part of the profit into the next prospecting cycle.",
        },
        (draft) => {
          const next = draft.prospects.find((prospect) => prospect.id !== target.id);
          if (next) {
            draft.selectedProspectId = next.id;
            updateProspect(draft, next.id, {
              status: "Qualified",
              agentState: "RESEARCHING",
            });
          }
          draft.agentStatus = "Running";
        },
        4500,
      );

      mutate((draft) => {
        draft.runningDemo = false;
        draft.agentStatus = "Running";
      });
    },
    [approveCall, mutate],
  );

  const metrics = useMemo(() => calculateMetrics(state), [state]);

  const value = useMemo<RevenueLoopContextValue>(
    () => ({
      state,
      metrics,
      resetDemo,
      runDemo,
      pauseAgent,
      discoverProspects,
      generateWebsite,
      approveCall,
      markDoNotContact,
      updateWebsiteSection,
      updateWebsiteTheme,
      publishWebsite,
      selectProspect,
    }),
    [
      state,
      metrics,
      resetDemo,
      runDemo,
      pauseAgent,
      discoverProspects,
      generateWebsite,
      approveCall,
      markDoNotContact,
      updateWebsiteSection,
      updateWebsiteTheme,
      publishWebsite,
      selectProspect,
    ],
  );

  return (
    <RevenueLoopContext.Provider value={value}>
      {children}
    </RevenueLoopContext.Provider>
  );
}

export function useRevenueLoop() {
  const context = useContext(RevenueLoopContext);
  if (!context) {
    throw new Error("useRevenueLoop must be used inside RevenueLoopProvider.");
  }
  return context;
}
