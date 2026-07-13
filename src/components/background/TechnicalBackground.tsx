"use client";

import React from "react";
import { Tooltip } from "react-tooltip";
import { GeneratorConfig } from "@/types";
import { Card } from "@/components/Card";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

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
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background' && l.year === activeYear) {
        return {
          ...l,
          cleared: false,
          customFrequency: undefined
        };
      }
      return l;
    });
    onChange({ ...config, layers: nextLayers });
  };

  const handleApplyAll = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        return {
          ...l,
          cleared: false,
          customFrequency: undefined
        };
      }
      return l;
    });
    onChange({ ...config, layers: nextLayers });
  };

  const handleDeleteSelected = () => {
    if (!activeYear) return;
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background' && l.year === activeYear) {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });
    onChange({ ...config, layers: nextLayers });
  };

  const handleDeleteAll = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });
    onChange({ ...config, layers: nextLayers });
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
      title={t('technicalTitle')}
      className="base-vibe"
      collapsible={true}
      extraHeaderActions={<></>}
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

      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "14px 0 10px 0" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold" }}>Apply to:</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={handleApplySelected}
            style={{
              padding: "4px 10px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(88, 166, 255, 0.1)",
              border: "1px solid rgba(88, 166, 255, 0.3)",
              color: "#58a6ff",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
          >
            Selected
          </button>
          <button
            type="button"
            onClick={handleApplyAll}
            style={{
              padding: "4px 10px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
          >
            All
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
          <Trash2 size={13} style={{ color: "#f85149" }} /> Clear:
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={handleDeleteSelected}
            style={{
              padding: "4px 10px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(248, 81, 73, 0.1)",
              border: "1px solid rgba(248, 81, 73, 0.3)",
              color: "#f85149",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
          >
            Selected
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            style={{
              padding: "4px 10px",
              fontSize: "0.75rem",
              borderRadius: "6px",
              background: "rgba(248, 81, 73, 0.15)",
              border: "1px solid rgba(248, 81, 73, 0.4)",
              color: "#f85149",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
          >
            All
          </button>
        </div>
      </div>
    </Card>
  );
}
