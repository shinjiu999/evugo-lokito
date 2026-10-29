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
 * Clean, stable panel card container with soft sporty tosca depth and zero 3D tilt/wobble,
 * providing maximum visual comfort and precision for user interaction.
 */
export default function Interactive3DCard({
  children,
  className = "",
  glowColor = "rgba(45, 212, 191, 0.18)",
}: Interactive3DCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-teal-400/20 bg-[#091d24]/90 backdrop-blur-xl transition-all duration-200 overflow-hidden shadow-lg ${className}`}
      style={{
        boxShadow: `0 12px 32px -12px rgba(3, 12, 16, 0.7), 0 0 1px 1px ${glowColor.replace(/[\d.]+\)$/g, "0.14)")}`,
      }}
    >
      <div className="w-full h-full relative z-10">
        {children}
      </div>
    </div>
  );
}
