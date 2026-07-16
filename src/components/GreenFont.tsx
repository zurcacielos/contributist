import React from "react";

interface GreenFontProps {
  children: React.ReactNode;
  variation?: "green-classic" | "green-bright";
  style?: React.CSSProperties;
  as?: React.ElementType;
  sober?: boolean;
}

export function GreenFont({
  children,
  variation = "green-classic",
  style = {},
  as: Component = "span",
  sober = true
}: GreenFontProps) {
  const gradient =
    variation === "green-bright"
      ? "linear-gradient(90deg, #00ff66, #39d353, #00ffcc)"
      : "linear-gradient(90deg, #0e4429, #26a641, #39d353)";

  const textStyles: React.CSSProperties = sober
    ? {
        color: "var(--level-3, #26a641)",
        fontWeight: "bold",
        ...style
      }
    : {
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: "bold",
        ...style
      };

  return (
    <Component style={textStyles}>
      {children}
    </Component>
  );
}

