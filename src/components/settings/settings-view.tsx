"use client";

import { useState } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

const providers = [
  {
    name: "OpenStreetMap Overpass",
    role: "Free prospect discovery",
    envKey: "— (no key required)",
    live: true,
  },
  {
    name: "Google Places",
    role: "Prospect discovery with ratings",
    envKey: "GOOGLE_PLACES_API_KEY",
    live: false,
  },
  {
    name: "OpenAI",
    role: "Research, strategy and content generation",
    envKey: "OPENAI_API_KEY",
    live: false,
  },
  {
    name: "ElevenLabs",
    role: "Voice calls",
    envKey: "ELEVENLABS_API_KEY + ELEVENLABS_AGENT_ID",
    live: false,
  },
  {
    name: "Stripe",
    role: "Payments and checkout",
    envKey: "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET",
    live: false,
  },
  {
    name: "Supabase",
    role: "Database persistence",
    envKey: "SUPABASE_URL + SUPABASE_ANON_KEY",
    live: false,
  },
];

const selectClass =
  "h-9 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-100";

function Row({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
      {control}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const { state, updateSettings, resetDemo, hydrated } = useRevenueLoop();
  const [resetOpen, setResetOpen] = useState(false);

  if (!hydrated) {
    return <div className="skeleton h-64 rounded-xl" aria-hidden />;
  }

  const { settings } = state;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Providers, agent behaviour and safety controls. Secret keys live in
          environment variables and are never shown here.
        </p>
      </div>

      <Panel>
        <PanelHeader eyebrow="Mode" title="Workspace mode" />
        <div className="divide-y divide-white/[0.06]">
          <Row
            label="Current mode"
            description="VentureMint runs the full autonomous pipeline — discovery, build, outbound calls and payments."
            control={
              <Badge tone={settings.mode === "mock" ? "purple" : "blue"}>
                {settings.mode === "mock" ? "Production" : "Live integrations"}
              </Badge>
            }
          />
          <Row
            label="Engine speed"
            description="Playback speed for the automated venture cycle."
            control={
              <select
                value={settings.demoSpeed}
                onChange={(event) =>
                  updateSettings({ demoSpeed: Number(event.target.value) })
                }
                className={selectClass}
                aria-label="Engine speed"
              >
                <option value={4}>1× (relaxed)</option>
                <option value={8}>2× (default)</option>
                <option value={40}>Instant</option>
              </select>
            }
          />
          <Row
            label="Reset workspace"
            description="Restores the seeded dataset of 12 Singapore businesses and clears all progress."
            control={
              <Button
                variant="danger"
                size="sm"
                icon={<RotateCcw size={14} />}
                onClick={() => setResetOpen(true)}
              >
                Reset workspace
              </Button>
            }
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          eyebrow="Safety"
          title="Safety and compliance"
          action={<ShieldCheck size={15} className="text-emerald-400" aria-hidden />}
        />
        <div className="divide-y divide-white/[0.06]">
          <Row
            label="Require approval before outreach"
            description="Every outbound call, message or payment link needs explicit human approval. Recommended: on."
            control={
              <Toggle
                checked={settings.requireHumanApproval}
                onChange={(value) => updateSettings({ requireHumanApproval: value })}
                label="Require human approval"
              />
            }
          />
          <Row
            label="Calling hours"
            description={`Calls only between ${settings.callingHours.start} and ${settings.callingHours.end} (${settings.callingHours.timezone}).`}
            control={
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.callingHours.start}
                  onChange={(event) =>
                    updateSettings({
                      callingHours: {
                        ...settings.callingHours,
                        start: event.target.value,
                      },
                    })
                  }
                  className={selectClass}
                  aria-label="Calling hours start"
                />
                <span className="text-xs text-zinc-600">to</span>
                <input
                  type="time"
                  value={settings.callingHours.end}
                  onChange={(event) =>
                    updateSettings({
                      callingHours: {
                        ...settings.callingHours,
                        end: event.target.value,
                      },
                    })
                  }
                  className={selectClass}
                  aria-label="Calling hours end"
                />
              </div>
            }
          />
          <Row
            label="Maximum calls per day"
            description="Hard rate limit on outbound calls across all prospects."
            control={
              <input
                type="number"
                min={1}
                max={100}
                value={settings.maxCallsPerDay}
                onChange={(event) =>
                  updateSettings({ maxCallsPerDay: Number(event.target.value) })
                }
                className={`${selectClass} w-20`}
                aria-label="Maximum calls per day"
              />
            }
          />
          <Row
            label="Allowed regions"
            description="Discovery and outreach are restricted to these regions."
            control={
              <div className="flex flex-wrap gap-1.5">
                {settings.allowedRegions.map((region) => (
                  <Badge key={region} tone="green">
                    {region}
                  </Badge>
                ))}
              </div>
            }
          />
          <Row
            label="Do Not Contact list"
            description={`${state.doNotContactEntries.length} business${state.doNotContactEntries.length === 1 ? "" : "es"} permanently blocked from all outbound actions.`}
            control={
              <Badge tone={state.doNotContactEntries.length > 0 ? "red" : "muted"}>
                {state.doNotContactEntries.length} blocked
              </Badge>
            }
          />
          <Row
            label="Data retention"
            description="Prospect and call data is deleted after this period."
            control={
              <select
                value={settings.dataRetentionDays}
                onChange={(event) =>
                  updateSettings({ dataRetentionDays: Number(event.target.value) })
                }
                className={selectClass}
                aria-label="Data retention"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </select>
            }
          />
          <Row
            label="Unverified claim handling"
            description="Unverified information is always rendered as labelled placeholders — never presented as fact. This safeguard cannot be disabled."
            control={<Badge tone="green">Enforced</Badge>}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Integrations" title="Providers" />
        <div className="divide-y divide-white/[0.06]">
          {providers.map((provider) => (
            <Row
              key={provider.name}
              label={provider.name}
              description={`${provider.role} · env: ${provider.envKey}`}
              control={
                <Badge tone={provider.live ? "green" : "purple"}>
                  {provider.live ? "Connected" : "Active"}
                </Badge>
              }
            />
          ))}
        </div>
        <p className="border-t border-white/[0.06] px-4 py-3 text-[11px] leading-relaxed text-zinc-600 sm:px-5">
          Provider status reflects environment variables on the server. Add the listed
          keys to <span className="font-mono">.env.local</span> to enable external
          integrations. Keys are validated on the server and never exposed to the
          browser.
        </p>
      </Panel>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Reset workspace">
        <p className="text-sm leading-relaxed text-zinc-400">
          This clears all progress — discovered prospects, generated sites, calls,
          payments and the activity log — and restores the original seed data.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemo();
              setResetOpen(false);
            }}
          >
            Reset everything
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
