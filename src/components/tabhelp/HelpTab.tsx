import React from "react";
import { HelpCircle, Info, BookOpen, Layers, ShieldCheck, Terminal, Sliders, Link, MousePointer, ExternalLink } from "lucide-react";
import { SynthFont } from "@/components/SynthFont";
import { useTranslations } from "next-intl";

export function HelpTab() {
  const t = useTranslations('Help');

  return (
    <div
      className="layout"
      style={{
        display: "block",
        overflowY: "auto",
        height: "100%",
        width: "100%",
        padding: "24px 12px"
      }}
    >
      <div
        className="help-tab-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          maxWidth: "1100px",
          margin: "0 auto",
          color: "var(--text-main)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* Section: How it works */}
        <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", display: "flex", alignItems: "center", gap: "10px", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
            <BookOpen size={24} style={{ color: "var(--greenbash, #086244)" }} /> {t('howItWorks')}
          </h2>
          <ul style={{
            fontSize: "15px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            margin: 0,
            paddingLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <li>
              {t('step1Text')}
            </li>
            <li>
              {t('step2Prefix')}<SynthFont>{t('step2Synth')}</SynthFont>
            </li>
            <li>
              {t('step3Text')}
            </li>
            <li>
              {t('step4Text')}
            </li>
          </ul>
        </section>

        {/* Welcome / Header (Why Contributist) */}
        <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
            <HelpCircle size={18} style={{ color: "var(--primary, #2ea043)" }} /> {t('whyTitle')}
          </h3>
          <ul style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            margin: 0,
            paddingLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <li>{t('manifesto3')}</li>
            <li>{t('manifesto1')}</li>
            <li><SynthFont>{t('manifesto2')}</SynthFont></li>
            <li><SynthFont>{t('manifesto4')}</SynthFont></li>
          </ul>
        </section>

        {/* Section: Technology Stack */}
        <section style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
          <h3 style={{ fontSize: "20px", margin: 0, textTransform: "none", letterSpacing: "normal" }}>{t('techTitle')}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

            {/* React Card */}
            <div className="card tech-card" style={{ padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <svg viewBox="-11.5 -10.23174 23 20.46348" width="48" height="48" fill="none" stroke="#61dafb" strokeWidth="1">
                <title>React Logo</title>
                <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
                <g stroke="#61dafb" strokeWidth="1" fill="none">
                  <ellipse rx="11" ry="4.2" />
                  <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                  <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
              </svg>
              <h4 style={{ margin: 0, fontSize: "16px" }}>React</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('reactDesc')}
              </p>
            </div>

            {/* Next.js Card */}
            <div className="card tech-card" style={{ padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <svg viewBox="0 0 180 180" width="48" height="48" fill="none">
                <title>Next.js Logo</title>
                <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                  <circle cx="90" cy="90" r="90" fill="#fff" />
                </mask>
                <g mask="url(#mask0)">
                  <circle cx="90" cy="90" r="90" fill="#000" stroke="#fff" strokeWidth="6" />
                  <path d="M149.508 157.52L69.142 54H54v72h12.18V68.57l70.137 90.04c4.135-3.327 7.892-7.084 11.22-11.22l2.091.13z" fill="url(#paint0_linear)" />
                  <rect x="115.8" y="54" width="12" height="72" fill="url(#paint1_linear)" />
                </g>
                <defs>
                  <linearGradient id="paint0_linear" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="121.8" y1="54" x2="121.8" y2="126" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <h4 style={{ margin: 0, fontSize: "16px" }}>Next.js</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('nextDesc')}
              </p>
            </div>

            {/* Zustand Card */}
            <div className="card tech-card" style={{ padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <svg viewBox="0 0 100 100" width="48" height="48">
                <title>Zustand Logo</title>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e0e0e0" strokeWidth="4" strokeDasharray="5,5" />
                <circle cx="50" cy="50" r="14" fill="#a855f7" />
                <circle cx="25" cy="30" r="8" fill="#ec4899" />
                <line x1="25" y1="30" x2="40" y2="43" stroke="#ec4899" strokeWidth="2" />
                <circle cx="75" cy="35" r="8" fill="#3b82f6" />
                <line x1="75" y1="35" x2="58" y2="44" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="45" cy="80" r="8" fill="#10b981" />
                <line x1="45" y1="80" x2="49" y2="64" stroke="#10b981" strokeWidth="2" />
              </svg>
              <h4 style={{ margin: 0, fontSize: "16px" }}>Zustand</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('zustandDesc')}
              </p>
            </div>

            {/* GitHub Card */}
            <a
              href="https://github.com/zurcacielos/contributist"
              target="_blank"
              rel="noopener noreferrer"
              className="card tech-card"
              style={{
                padding: "20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                position: "relative"
              }}
            >
              <ExternalLink
                size={16}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  color: "var(--text-muted)",
                  opacity: 0.8
                }}
              />
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <title>GitHub Logo</title>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('githubTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('githubDesc')}
              </p>
            </a>

            {/* Vercel Card */}
            <div
              className="card tech-card"
              style={{
                padding: "20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <svg viewBox="0 0 115 100" width="48" height="48" fill="currentColor">
                <title>Vercel Logo</title>
                <path d="M57.5 0L115 100H0L57.5 0Z" />
              </svg>
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('vercelTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('vercelDesc')}
              </p>
            </div>

          </div>
        </section>

        {/* Section: Custom Engineering & Algorithms */}
        <section style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
          <h3 style={{ fontSize: "20px", margin: 0, textTransform: "none", letterSpacing: "normal" }}>{t('algoTitle')}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

            {/* Card 1: Procedural Noise */}
            <div className="card tech-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <Sliders size={32} style={{ color: "var(--greenbash, #086244)" }} />
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('proceduralNoiseTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('proceduralNoiseDesc')}
              </p>
            </div>

            {/* Card 2: Layer Compositing */}
            <div className="card tech-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <Layers size={32} style={{ color: "var(--greenbash, #086244)" }} />
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('layerCompositingTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('layerCompositingDesc')}
              </p>
            </div>

            {/* Card 3: URL Serialization */}
            <div className="card tech-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <Link size={32} style={{ color: "var(--greenbash, #086244)" }} />
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('stateSerializationTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('stateSerializationDesc')}
              </p>
            </div>

            {/* Card 4: Git Compilers */}
            <div className="card tech-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <Terminal size={32} style={{ color: "var(--greenbash, #086244)" }} />
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('gitTranspilationTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('gitTranspilationDesc')}
              </p>
            </div>

            {/* Card 5: Event Delegation */}
            <div className="card tech-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <MousePointer size={32} style={{ color: "var(--greenbash, #086244)" }} />
              <h4 style={{ margin: 0, fontSize: "16px" }}>{t('coordinateProjectionTitle')}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {t('coordinateProjectionDesc')}
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
