"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SplashEngineConsole } from "@/components/landing/splash-engine-console";
import { VentureMintLogo } from "@/components/landing/venturemint-logo";

const stages = [
  {
    num: "01",
    name: "Find",
    body: "Scan local businesses for operational gaps worth solving.",
  },
  {
    num: "02",
    name: "Analyse",
    body: "Size the gap, verify the opportunity, and confirm it is worth pursuing.",
  },
  {
    num: "03",
    name: "Build",
    body: "Create the tailored solution before any outreach begins.",
  },
  {
    num: "04",
    name: "Pitch",
    body: "Package proof, pricing, and a pitch — sent only after your approval.",
  },
  {
    num: "05",
    name: "Sell",
    body: "Close with something built, not promised. Track revenue from one place.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function LandingView() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0a0a0c] text-zinc-100">
      <motion.header
        className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0a0a0c]/85 backdrop-blur-md"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="VentureMint home">
            <VentureMintLogo size="md" />
          </Link>
          <nav className="flex items-center gap-6" aria-label="Main">
            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="hidden cursor-pointer text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-50 hover:underline sm:inline"
            >
              How it works
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
            >
              Explore VentureMint
            </Link>
          </nav>
        </div>
      </motion.header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-32">
          <motion.div
            className="text-justify"
            initial={reduced ? "visible" : "hidden"}
            animate="visible"
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 not-italic"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${reduced ? "" : "pulse-dot"}`}
                aria-hidden
              />
              Autonomous venture engine
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display mt-7 max-w-4xl text-left text-[2.75rem] font-medium leading-[1.06] tracking-[-0.01em] text-zinc-50 sm:text-6xl lg:text-[3.4rem] xl:text-[3.8rem]"
            >
              Turning business gaps into{" "}
              <em className="text-emerald-300">solutions we can sell.</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              A suite of 8 specialised agents that work together — with the main
              Venture Agent as the orchestrator — ready on call or running 24/7.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 text-left">
              <Link
                href="/dashboard"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-emerald-500 px-7 text-[15px] font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
              >
                Explore VentureMint
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-sm text-zinc-500">
              One Venture Agent. Eight specialists. Always on when you need them.
            </motion.p>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <SplashEngineConsole className="mx-auto w-full max-w-2xl lg:mx-0" />
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-white/[0.07]"
          aria-label="How VentureMint works"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <motion.div
              className="text-justify"
              initial={reduced ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500"
              >
                How it works
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="font-display mt-4 text-left text-3xl font-medium leading-tight text-zinc-50 sm:text-4xl"
              >
                Five stages. One operator. The agents do the groundwork.
              </motion.h2>
            </motion.div>

            <motion.ol
              className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5"
              initial={reduced ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {stages.map((stage) => (
                <motion.li
                  key={stage.num}
                  variants={fadeUp}
                  className="border-t border-white/15 pt-5"
                >
                  <p className="font-mono text-xs text-emerald-400">{stage.num}</p>
                  <h3 className="font-display mt-3 text-xl font-medium text-zinc-100">
                    {stage.name}
                  </h3>
                  <p className="mt-2.5 text-justify text-sm leading-relaxed text-zinc-400">
                    {stage.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <VentureMintLogo size="sm" />
          <nav className="flex items-center gap-6 text-sm text-zinc-500" aria-label="Footer">
            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="cursor-pointer transition-colors hover:text-zinc-100"
            >
              How it works
            </button>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-zinc-100"
            >
              Explore VentureMint
            </Link>
          </nav>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} VentureMint
          </p>
        </div>
      </footer>
    </div>
  );
}
