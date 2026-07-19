"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (timeoutId) clearTimeout(timeoutId);
    setToast(message);
    setVisible(true);

    const id = setTimeout(() => {
      setVisible(false);
    }, 3000);
    setTimeoutId(id);
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 18px",
            borderRadius: "8px",
            backgroundColor: "var(--toast-bg)",
            border: "1px solid var(--toast-border)",
            boxShadow: "var(--toast-shadow)",
            color: "var(--toast-text)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transform: visible ? "translateY(0)" : "translateY(100px)",
            opacity: visible ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: visible ? "auto" : "none"
          }}
        >
          <span style={{ color: "var(--green)", fontWeight: "bold" }}>$</span> {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
