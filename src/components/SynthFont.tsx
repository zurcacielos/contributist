import React from "react";

interface SynthFontProps {
  children: React.ReactNode;
  variation?: "pink-cyan" | "pink-purple-cyan";
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export function SynthFont({
  children,
  variation = "pink-cyan",
  style = {},
  as: Component = "span"
}: SynthFontProps) {
  const gradient =
    variation === "pink-purple-cyan"
      ? "linear-gradient(90deg, #ff007f, #8e24aa, #00d2ff)"
      : "linear-gradient(90deg, #ff007f, #ff00ff, #00d2ff)";

  return (
    <Component
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: "bold",
        ...style
      }}
    >
      {children}
    </Component>
  );
}
