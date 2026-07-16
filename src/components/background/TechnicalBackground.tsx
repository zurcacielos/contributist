"use client";

import React from "react";
import { Tooltip } from "react-tooltip";
import { GeneratorConfig } from "@/types";
import { Card } from "@/components/Card";
import { GreenFont } from "@/components/GreenFont";
import { useTranslations } from "next-intl";

import { applyBackgroundSelected, applyBackgroundAll } from "@/utils/backgroundActions";

interface TechnicalBackgroundProps {
  config: GeneratorConfig;
  activeYear?: number;
  onChange: (config: GeneratorConfig) => void;
}

export function TechnicalBackground({
  config,
  activeYear,
  onChange,
}: TechnicalBackgroundProps) {
  const t = useTranslations('Sidebar');
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

  const handleApplySelected = () => {
    if (!activeYear) return;
    applyBackgroundSelected(config, activeYear, "advanced", undefined, onChange);
  };

  const handleApplyAll = () => {
    applyBackgroundAll(config, "advanced", undefined, onChange);
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
      title={<GreenFont>{t('technicalTitle')}</GreenFont>}
      className="base-vibe"
      collapsible={true}
      defaultExpanded={false}
      extraHeaderActions={<></>}
      textTransformTitle="none"
      alwaysVisibleContent={
        <div style={{ marginTop: "10px" }}>
          {/* Make All Greener */}
          <button
            type="button"
            onClick={handleApplyAll}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border)",
              color: "var(--greenbash-selected, #39d353)",
              cursor: "pointer",
              fontWeight: "bold",
              fontFamily: "var(--font-mono, monospace)",
              transition: "all 0.2s ease",
              textAlign: "center",
              marginBottom: "6px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(57, 211, 83, 0.12)";
              e.currentTarget.style.borderColor = "var(--greenbash-selected, #39d353)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--greenbash-selected, #39d353)";
            }}
          >
            {t('makeAllGreener')}
          </button>

          {/* Make Selected Greener */}
          <button
            type="button"
            onClick={handleApplySelected}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border)",
              color: "var(--greenbash-selected, #39d353)",
              cursor: "pointer",
              fontWeight: "bold",
              fontFamily: "var(--font-mono, monospace)",
              transition: "all 0.2s ease",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(57, 211, 83, 0.12)";
              e.currentTarget.style.borderColor = "var(--greenbash-selected, #39d353)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--greenbash-selected, #39d353)";
            }}
          >
            {t('makeSelectedGreener')}
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", gap: "10px", margin: "10px 0", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>{t('from')}</span>
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
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>{t('to')}</span>
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
          {t('commitFreq')}
          <InfoIcon text={t('commitFreqTip')} />
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
        <span>{t('maxComDay')}</span>
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
        <span>{t('weekends')}</span>
        <button
          type="button"
          onClick={() => onChange({ ...config, noWeekends: !config.noWeekends })}
          style={{
            cursor: "pointer",
            background: !config.noWeekends ? "rgba(57, 211, 83, 0.15)" : "rgba(0, 0, 0, 0.4)",
            color: !config.noWeekends ? "var(--greenbash-selected, #39d353)" : "var(--text-muted)",
            border: !config.noWeekends ? "1px solid var(--greenbash-selected, #39d353)" : "1px solid var(--border)",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            fontFamily: "var(--font-mono, monospace)",
            transition: "all 0.2s ease"
          }}
        >
          {!config.noWeekends ? t('on') : t('off')}
        </button>
      </div>

      <div className="control-row compact">
        <span style={{ display: "flex", alignItems: "center" }}>
          {t('vacations')}
          <InfoIcon text={t('vacationsTip')} />
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
          {t('daysVacation')}
          <InfoIcon text={t('daysVacationTip')} />
        </span>
        <input
          type="text"
          name="vacationLengthDays"
          className="form-control"
          style={{ width: "70px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
          placeholder="14,28,21"
          value={config.vacationLengthDays}
          onChange={handleChange}
        />
      </div>
    </Card>
  );
}
