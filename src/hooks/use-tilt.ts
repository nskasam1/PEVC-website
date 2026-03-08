import { useMotionValue, useSpring, useTransform } from "framer-motion";
import type React from "react";

export function useTilt(intensity = 9) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const xSpring = useSpring(mouseX, { stiffness: 220, damping: 22 });
  const ySpring = useSpring(mouseY, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-intensity, intensity]);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return {
    motionStyle: {
      rotateX,
      rotateY,
      transformStyle: "preserve-3d" as const,
    },
    onMouseMove,
    onMouseLeave,
  };
}
