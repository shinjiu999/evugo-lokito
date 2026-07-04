import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation angle in degrees
  perspective?: number; // Perspective distance in pixels
  glareOpacity?: number; // Max opacity of the glare flare
  glowColor?: string; // Border pulse glow color
  enableHoverScale?: boolean; // Whether to scale up slightly on hover
}

export default function Interactive3DCard({
  children,
  className = "",
  maxTilt = 12,
  perspective = 1000,
  glareOpacity = 0.35,
  glowColor = "rgba(59, 130, 246, 0.4)", // default blue
  enableHoverScale = true
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt angles
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring animations for buttery smooth transitions
  const springConfig = { damping: 25, stiffness: 220, mass: 0.8 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Glare position motion values
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareXSpring = useSpring(glareX, springConfig);
  const glareYSpring = useSpring(glareY, springConfig);

  // Dynamic shadows depending on tilt direction
  const shadowX = useTransform(rotateYSpring, (val) => -val * 1.5);
  const shadowY = useTransform(rotateXSpring, (val) => val * 1.5);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinate relative to the card element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map coordinate to range [-0.5, 0.5]
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    // Calculate rotation angles
    // Tilt X depends on Y mouse offset (movement up/down tilts around X axis)
    // Tilt Y depends on X mouse offset (movement left/right tilts around Y axis)
    const nextRotateX = yPct * maxTilt;
    const nextRotateY = -xPct * maxTilt;

    rotateX.set(nextRotateX);
    rotateY.set(nextRotateY);

    // Map coordinates to percentage [0, 100] for glare placement
    glareX.set((mouseX / width) * 100);
    glareY.set((mouseY / height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset all rotations smoothly back to zero
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: perspective,
        transformStyle: "preserve-3d"
      }}
      className={`relative rounded-3xl transition-shadow duration-300 ${className}`}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          scale: enableHoverScale && isHovered ? 1.025 : 1,
          boxShadow: isHovered 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px ${glowColor}`
            : "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0d12]/90 backdrop-blur-xl transition-all duration-300"
      >
        {/* Ambient background lights in card edges on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor.replace(/[\d.]+\)$/g, "0.15)")}, transparent 80%)`,
          }}
        />

        {/* Glare Glass Overlay Shine */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: useTransform(
              [glareXSpring, glareYSpring],
              ([x, y]) => `radial-gradient(circle 180px at ${x}% ${y}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 45%, transparent 80%)`
            ),
            mixBlendMode: "overlay"
          }}
        />

        {/* Dynamic Holographic Diagonal Color Sheen (adds elite futuristic premium card vibe) */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.06 : 0,
            background: "linear-gradient(135deg, #ff007f 0%, #00f0ff 50%, #7f00ff 100%)",
            mixBlendMode: "color-dodge"
          }}
        />

        {/* Inner glow outline trail */}
        <div 
          className="absolute inset-px rounded-[23px] pointer-events-none z-20 transition-colors duration-300"
          style={{
            boxShadow: isHovered 
              ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px ${glowColor.replace(/[\d.]+\)$/g, "0.2)")}`
              : "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)"
          }}
        />

        {/* Card Content inside a 3D preserve container */}
        <div 
          style={{ transform: "translateZ(10px)" }} 
          className="w-full h-full relative z-10"
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
