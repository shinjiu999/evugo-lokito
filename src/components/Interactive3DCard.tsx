import React from "react";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  glareOpacity?: number;
  glowColor?: string;
  enableHoverScale?: boolean;
}

/**
 * Clean, stable panel card container with subtle depth and zero 3D tilt/wobble,
 * providing maximum comfort and precision for user interaction with inputs, buttons, and sliders.
 */
export default function Interactive3DCard({
  children,
  className = "",
  glowColor = "rgba(16, 185, 129, 0.2)",
}: Interactive3DCardProps) {
  return (
    <div
      className={`relative rounded-3xl border border-emerald-500/15 bg-[#081812]/90 backdrop-blur-xl transition-all duration-200 overflow-hidden shadow-lg ${className}`}
      style={{
        boxShadow: `0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px ${glowColor.replace(/[\d.]+\)$/g, "0.15)")}`,
      }}
    >
      <div className="w-full h-full relative z-10">
        {children}
      </div>
    </div>
  );
}
