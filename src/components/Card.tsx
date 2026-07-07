import React, { useState } from "react";

interface CardProps {
  title: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  extraHeaderActions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  collapsible = false,
  defaultExpanded = true,
  extraHeaderActions,
  className = "",
  style,
  children
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  return (
    <section className={`card ${className}`} style={style}>
      <div 
        className="panel-heading" 
        onClick={handleToggle}
        style={{
          cursor: collapsible ? "pointer" : "default",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: (!collapsible || expanded) ? "16px" : "0px",
          userSelect: "none"
        }}
      >
        <h2>{title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
          {extraHeaderActions}
          {collapsible && (
            <button
              type="button"
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "var(--text-main)",
                cursor: "pointer",
                fontSize: "1rem",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "28px"
              }}
            >
              {expanded ? "−" : "+"}
            </button>
          )}
        </div>
      </div>
      {(!collapsible || expanded) && (
        <div>
          {children}
        </div>
      )}
    </section>
  );
};
