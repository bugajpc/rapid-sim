import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            backgroundColor: "#111416",
            color: "#e2e8f0",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              padding: "28px",
              backgroundColor: "#1c2227",
              border: "1px solid #3b464f",
              borderRadius: "8px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#7f1d1d",
                color: "#fca5a5",
                fontSize: "20px",
                marginBottom: "16px",
              }}
            >
              ⚠
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", color: "#f87171" }}>
              {this.props.fallbackTitle || "Wystąpił nieoczekiwany błąd w aplikacji"}
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
              Interfejs symulatora napotkał problem podczas renderowania. Możesz zrestartować aplikację
              lub wyczyścić zapisany stan sesji.
            </p>
            {this.state.error && (
              <pre
                style={{
                  margin: "0 0 20px",
                  padding: "10px",
                  backgroundColor: "#0d1114",
                  border: "1px solid #2d3741",
                  borderRadius: "5px",
                  color: "#fca5a5",
                  fontSize: "11px",
                  textAlign: "left",
                  overflowX: "auto",
                  maxHeight: "120px",
                }}
              >
                {this.state.error.name}: {this.state.error.message}
              </pre>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#eab308",
                  color: "#18140c",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Odśwież stronę
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("rapid-sim-student-projects");
                  window.location.reload();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#334155",
                  color: "#cbd5e1",
                  border: "1px solid #475569",
                  borderRadius: "5px",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Wyczyść pamięć podręczną i zresetuj
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
