import { useEffect, useState } from "react";
import type { Task } from "./rapid";

type Props = {
  task: Task;
  onClose: () => void;
  onLoadTask: (task: Task) => void;
  isSelected: boolean;
};

type TabKey = "content" | "signals" | "targets" | "tips";

export function TaskDetailsModal({ task, onClose, onLoadTask, isSelected }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("content");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isElm = task.category === "elm08";

  return (
    <div className="task-modal-backdrop" onMouseDown={onClose}>
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title-group">
            <div className="task-modal-tags">
              <span className={`task-badge ${task.category}`}>
                {isElm ? "Kwalifikacja CKE ELM.08" : "Zadanie Treningowe"}
              </span>
              {task.sheetId && <span className="task-sheet-badge">{task.sheetId}</span>}
              <span className="task-tool-badge">Narzędzie: {task.tool === "pen" ? "tPen (pisak)" : "tGripper (chwytak)"}</span>
            </div>
            <h2 id="task-modal-title">{task.title}</h2>
            <small>{task.topic}</small>
          </div>
          <button className="task-modal-close" onClick={onClose} title="Zamknij (Esc)">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="task-modal-tabs" role="tablist">
          <button
            className={`task-modal-tab ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
            role="tab"
            aria-selected={activeTab === "content"}
          >
            📋 Treść i algorytm
          </button>
          <button
            className={`task-modal-tab ${activeTab === "signals" ? "active" : ""}`}
            onClick={() => setActiveTab("signals")}
            role="tab"
            aria-selected={activeTab === "signals"}
          >
            🔌 Sygnały I/O {task.signalsTable ? `(${task.signalsTable.length})` : ""}
          </button>
          <button
            className={`task-modal-tab ${activeTab === "targets" ? "active" : ""}`}
            onClick={() => setActiveTab("targets")}
            role="tab"
            aria-selected={activeTab === "targets"}
          >
            📍 Punkty robtarget {task.targetsTable ? `(${task.targetsTable.length})` : ""}
          </button>
          <button
            className={`task-modal-tab ${activeTab === "tips" ? "active" : ""}`}
            onClick={() => setActiveTab("tips")}
            role="tab"
            aria-selected={activeTab === "tips"}
          >
            💡 Wskazówki RAPID ({task.tips.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="task-modal-body">
          {activeTab === "content" && (
            <div className="task-tab-pane">
              <div className="task-summary-box">
                <h4>Opis ogólny zadania</h4>
                <p>{task.summary}</p>
              </div>

              {task.workstationDescription && (
                <div className="task-section">
                  <h4>Opis stanowiska zrobotyzowanego</h4>
                  <p>{task.workstationDescription}</p>
                </div>
              )}

              {task.procedureSteps && task.procedureSteps.length > 0 && (
                <div className="task-section">
                  <h4>Algorytm postępowania krok po kroku (CKE)</h4>
                  <ol className="task-steps-list">
                    {task.procedureSteps.map((step, idx) => (
                      <li key={idx}>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {task.evaluationCriteria && task.evaluationCriteria.length > 0 && (
                <div className="task-section">
                  <h4>Kryteria oceny i wymogi technologiczne</h4>
                  <ul className="task-criteria-list">
                    {task.evaluationCriteria.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "signals" && (
            <div className="task-tab-pane">
              <h4>Zestawienie sygnałów elektrycznych I/O stanowiska</h4>
              {task.signalsTable && task.signalsTable.length > 0 ? (
                <table className="task-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Oznaczenie</th>
                      <th style={{ width: "100px" }}>Typ</th>
                      <th>Funkcja na stanowisku zrobotyzowanym</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.signalsTable.map((sig, idx) => (
                      <tr key={idx}>
                        <td>
                          <b className="signal-name-badge">{sig.name}</b>
                        </td>
                        <td>
                          <span className={`signal-type-tag ${sig.type.toLowerCase()}`}>
                            {sig.type === "DI" ? "Wejście DI" : "Wyjście DO"}
                          </span>
                        </td>
                        <td>{sig.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">Brak dedykowanych sygnałów I/O dla tego zadania.</p>
              )}
            </div>
          )}

          {activeTab === "targets" && (
            <div className="task-tab-pane">
              <h4>Punkty bazowe i trajektorii robota (robtarget)</h4>
              {task.targetsTable && task.targetsTable.length > 0 ? (
                <table className="task-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "160px" }}>Nazwa punktu</th>
                      <th>Przeznaczenie w procesie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.targetsTable.map((tgt, idx) => (
                      <tr key={idx}>
                        <td>
                          <code className="target-name-code">{tgt.name}</code>
                        </td>
                        <td>{tgt.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">Zadanie korzysta ze standardowych punktów biblioteki robota.</p>
              )}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="task-tab-pane">
              <h4>Wskazówki dla zdającego i dobre praktyki RAPID</h4>
              <ul className="task-tips-full-list">
                {task.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <div className="task-modal-status">
            {isSelected ? (
              <span className="task-active-badge">✓ Zadanie jest aktualnie otwarte w edytorze</span>
            ) : (
              <button
                className="task-load-btn"
                onClick={() => onLoadTask(task)}
                title="Wczytaj kod początkowy tego zadania do edytora"
              >
                🚀 Wczytaj to zadanie do edytora
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
