"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function VentureMintMascot({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: "dark" | "light";
}) {
  const reducedMotion = useReducedMotion();
  const light = theme === "light";

  return (
    <motion.div
      className={cn("relative", className)}
      role="img"
      aria-label="VentureMint scout mascot searching for business gaps"
      animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full max-w-[200px]"
      >
        <ellipse
          cx="100"
          cy="168"
          rx="42"
          ry="6"
          fill={light ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.04)"}
        />

        <path
          d="M100 48 C72 48 58 72 58 98 C58 124 76 142 100 142 C124 142 142 124 142 98 C142 72 128 48 100 48Z"
          fill={light ? "#f5e6d3" : "#17171b"}
          stroke={light ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.1)"}
          strokeWidth="1.5"
        />

        <circle cx="88" cy="92" r="3" fill={light ? "#57534e" : "#a1a1aa"} />
        <path
          d="M108 96 Q112 92 116 96"
          stroke={light ? "#78716c" : "#71717a"}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        <line
          x1="100"
          y1="48"
          x2="100"
          y2="32"
          stroke={light ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.15)"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="28"
          r="4"
          fill={light ? "rgba(5,150,105,0.15)" : "rgba(52,211,153,0.2)"}
          stroke={light ? "#059669" : "#34d399"}
          strokeWidth="1"
        />

        <motion.g
          style={{ transformOrigin: "130px 110px" }}
          animate={
            reducedMotion
              ? undefined
              : { rotate: [-8, 12, -8] }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <circle
            cx="130"
            cy="110"
            r="18"
            fill="none"
            stroke={light ? "#059669" : "#34d399"}
            strokeWidth="2.5"
            opacity="0.7"
          />
          <line
            x1="143"
            y1="123"
            x2="156"
            y2="136"
            stroke={light ? "#059669" : "#34d399"}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>

        <rect
          x="36"
          y="118"
          width="28"
          height="28"
          rx="4"
          fill={light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.03)"}
          stroke={light ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.12)"}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x="50"
          y="136"
          textAnchor="middle"
          fill={light ? "#78716c" : "#71717a"}
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          ?
        </text>

        <motion.g
          animate={
            reducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: [0.3, 1, 1], scale: [0.92, 1, 1] }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.7, 1] }
          }
        >
          <rect
            x="148"
            y="52"
            width="32"
            height="32"
            rx="4"
            fill={light ? "rgba(5,150,105,0.1)" : "rgba(52,211,153,0.12)"}
            stroke={light ? "rgba(5,150,105,0.35)" : "rgba(52,211,153,0.4)"}
            strokeWidth="1"
          />
          <path
            d="M158 68 L164 74 L172 62"
            stroke={light ? "#059669" : "#34d399"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.g>

        <rect
          x="62"
          y="58"
          width="36"
          height="22"
          rx="3"
          fill={light ? "#ffffff" : "#111114"}
          stroke={light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)"}
          strokeWidth="1"
        />
        <line
          x1="68"
          y1="66"
          x2="92"
          y2="66"
          stroke={light ? "rgba(15,23,42,0.15)" : "rgba(255,255,255,0.15)"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="68"
          y1="72"
          x2="84"
          y2="72"
          stroke={light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
