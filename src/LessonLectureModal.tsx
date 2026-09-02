import { useEffect, useState } from "react";
import type { Example } from "./rapid";

type Props = {
  example: Example;
  onClose: () => void;
  onLoadExample: (example: Example) => void;
  isSelected: boolean;
};

type TabKey = "overview" | "syntax" | "industrial" | "exam";

export function LessonLectureModal({ example, onClose, onLoadExample, isSelected }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const lecture = example.lecture;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="task-modal-backdrop" onMouseDown={onClose}>
      <div
        className="task-modal lecture-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lecture-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title-group">
            <div className="task-modal-tags">
              <span className="task-badge podstawowe">Wykład teoretyczny RAPID</span>
              <span className="task-sheet-badge">{example.topic}</span>
              {example.tool && (
                <span className="task-tool-badge">
                  Narzędzie: {example.tool === "pen" ? "tPen (pisak)" : "tGripper (chwytak)"}
                </span>
              )}
            </div>
            <h2 id="lecture-modal-title">{example.title}</h2>
            <small>{lecture?.title || example.summary}</small>
          </div>
          <button className="task-modal-close" onClick={onClose} title="Zamknij (Esc)">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="task-modal-tabs" role="tablist">
          <button
            className={`task-modal-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            role="tab"
            aria-selected={activeTab === "overview"}
          >
            📖 Teoria i zasada działania
          </button>
          <button
            className={`task-modal-tab ${activeTab === "syntax" ? "active" : ""}`}
            onClick={() => setActiveTab("syntax")}
            role="tab"
            aria-selected={activeTab === "syntax"}
          >
            ⚙️ Składnia instrukcji {lecture?.syntax ? `(${lecture.syntax.length})` : ""}
          </button>
          <button
            className={`task-modal-tab ${activeTab === "industrial" ? "active" : ""}`}
            onClick={() => setActiveTab("industrial")}
            role="tab"
            aria-selected={activeTab === "industrial"}
          >
            🏭 Standard ABB & Przemysł
          </button>
          <button
            className={`task-modal-tab ${activeTab === "exam" ? "active" : ""}`}
            onClick={() => setActiveTab("exam")}
            role="tab"
            aria-selected={activeTab === "exam"}
          >
            ⚠️ Wskazówki & Pułapki CKE ({lecture?.examTips.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div className="task-modal-body">
          {activeTab === "overview" && (
            <div className="task-tab-pane">
              <div className="task-summary-box">
                <h4>Cel edukacyjny lekcji</h4>
                <p>{example.summary}</p>
              </div>

              {lecture?.overview ? (
                <div className="task-section">
                  <h4>Wykład merytoryczny</h4>
                  <div className="lecture-text-content">
                    {lecture.overview.split("\n\n").map((para, idx) => (
                      <p key={idx} style={{ marginBottom: "12px", lineHeight: "1.65" }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="empty-text">Brak dodatkowego opisu teoretycznego.</p>
              )}

              {lecture?.keyConcepts && lecture.keyConcepts.length > 0 && (
                <div className="task-section">
                  <h4>Kluczowe pojęcia i reguły</h4>
                  <ul className="task-tips-full-list">
                    {lecture.keyConcepts.map((concept, idx) => (
                      <li key={idx}>{concept}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "syntax" && (
            <div className="task-tab-pane">
              <h4>Formatowanie i składnia instrukcji RAPID</h4>
              {lecture?.syntax && lecture.syntax.length > 0 ? (
                <table className="task-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "130px" }}>Instrukcja</th>
                      <th style={{ width: "220px" }}>Wzorzec składniowy</th>
                      <th>Opis działania i parametry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecture.syntax.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <b className="signal-name-badge" style={{ color: "#38bdf8" }}>
                            {item.instruction}
                          </b>
                        </td>
                        <td>
                          <code className="target-name-code" style={{ fontSize: "11px" }}>
                            {item.syntax}
                          </code>
                        </td>
                        <td>
                          <div>{item.description}</div>
                          {item.params && item.params.length > 0 && (
                            <small style={{ display: "block", marginTop: "4px", color: "#94a3b8" }}>
                              Parametry: {item.params.join(", ")}
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">Brak zdefiniowanych tabelarycznych wzorców składniowych.</p>
              )}
            </div>
          )}

          {activeTab === "industrial" && (
            <div className="task-tab-pane">
              <h4>Kontekst przemysłowy – ABB Robotics & FlexPendant</h4>
              {lecture?.industrialContext ? (
                <div className="task-section">
                  <div className="industrial-context-box" style={{ background: "#1c2630", borderLeft: "4px solid #38bdf8", padding: "14px", borderRadius: "4px" }}>
                    <p style={{ margin: 0, lineHeight: "1.65", color: "#e2e8f0" }}>
                      {lecture.industrialContext}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="empty-text">Informacje przemysłowe zgodne ze standardem ABB OmniCore / IRC5.</p>
              )}
            </div>
          )}

          {activeTab === "exam" && (
            <div className="task-tab-pane">
              <h4>Wymagania egzaminacyjne CKE i typowe pułapki (ELM.08)</h4>
              {lecture?.examTips && lecture.examTips.length > 0 ? (
                <ul className="task-tips-full-list" style={{ color: "#fef08a" }}>
                  {lecture.examTips.map((tip, idx) => (
                    <li key={idx}>
                      <span style={{ color: "#e2e8f0" }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">Brak specyficznych uwag egzaminacyjnych dla tej lekcji.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <div className="task-modal-status">
            {isSelected ? (
              <span className="task-active-badge">✓ Ten program jest aktualnie otwarty w edytorze</span>
            ) : (
              <button
                className="task-load-btn"
                onClick={() => onLoadExample(example)}
                title="Wczytaj ten kod lekcji do edytora"
              >
                🚀 Wczytaj program do edytora
              </button>
            )}
          </div>
          <button className="task-close-btn" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
