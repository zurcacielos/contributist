"use client";

import React from "react";
import { Tooltip } from "react-tooltip";
import { GeneratorConfig } from "@/types";
import { Card } from "@/components/Card";

interface TechnicalBackgroundProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

export function TechnicalBackground({
  config,
  onChange,
}: TechnicalBackgroundProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === "number") {
      finalValue = parseInt(value, 10);
      if (isNaN(finalValue)) finalValue = 0;
    } else if (type === "checkbox") {
      finalValue = e.target.checked;
    }

    onChange({
      ...config,
      [name]: finalValue,
    });
  };

  const InfoIcon = ({ text }: { text: string }) => (
    <span
      className="info-icon"
      data-tooltip-id="info-tooltip"
      data-tooltip-content={text}
    >i</span>
  );

  return (
    <Card
      title="⚙️ Advanced"
      className="base-vibe"
      collapsible={true}
      extraHeaderActions={<></>}
    >
      <div style={{ display: "flex", gap: "10px", margin: "10px 0", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>From</span>
          <input
            type="text"
            name="startDate"
            className="form-control"
            style={{ width: "100%", minWidth: "50px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
            placeholder="2014"
            value={config.startDate}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>To</span>
          <input
            type="text"
            name="endDate"
            className="form-control"
            style={{ width: "100%", minWidth: "50px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
            placeholder="present"
            value={config.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="control-row compact">
        <span style={{ display: "flex", alignItems: "center" }}>
          Commit Freq. %
          <InfoIcon text="Base probability per year. Accepts CSV values (e.g., 30,50,45) which cycle through the years. Put a zero for a blank background." />
        </span>
        <input
          type="text"
          name="frequencies"
          className="form-control"
          style={{ width: "90px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
          placeholder="30,50,45"
          value={config.frequencies}
          onChange={handleChange}
        />
      </div>

      <div className="control-row compact">
        <span>Max.Com/Day</span>
        <input
          type="number"
          name="maxCommitsPerDay"
          className="form-control"
          style={{ width: "60px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
          min="1"
          max="20"
          value={config.maxCommitsPerDay}
          onChange={handleChange}
        />
      </div>

      <div className="control-row compact">
        <span>Weekends</span>
        <button
          type="button"
          onClick={() => onChange({ ...config, noWeekends: !config.noWeekends })}
          style={{
            cursor: "pointer",
            background: !config.noWeekends ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
            color: !config.noWeekends ? "#10b981" : "var(--text-muted)",
            border: !config.noWeekends ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            transition: "all 0.2s ease"
          }}
        >
          {!config.noWeekends ? "ON" : "OFF"}
        </button>
      </div>

      <div className="control-row compact">
        <span style={{ display: "flex", alignItems: "center" }}>
          Vacations
          <InfoIcon text="Amount of vacations per year, meaning patches of inactivity, to pick randomly (comma-separated).&#10;E.g.: 1,2,2 means there's double the chance to have 2 vacations on each year." />
        </span>
        <input
          type="text"
          name="vacationsPerYear"
          className="form-control"
          style={{ width: "70px", padding: "4px 8px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
          placeholder="1,2,2"
          value={config.vacationsPerYear}
          onChange={handleChange}
        />
      </div>

      <div className="control-row compact">
        <span style={{ display: "flex", alignItems: "center" }}>
          Days/Vacation
          <InfoIcon text="Length of each vacation in days to pick randomly (comma-separated).&#10;E.g.: 14,28,14 means higher chance of 14 days." />
        </span>
        <input
          type="text"
          name="vacationLengthDays"
          className="form-control"
          style={{ width: "90px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
          placeholder="14,28,21"
          value={config.vacationLengthDays}
          onChange={handleChange}
        />
      </div>
    </Card>
  );
}
