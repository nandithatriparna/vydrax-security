import { useState } from "react";
import { scanTarget } from "./api";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Overview");
  const [target, setTarget] = useState("");
  const [assetType, setAssetType] = useState("URL");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const navigation = [
    { name: "Overview", icon: "◫" },
    { name: "Threat Scanner", icon: "⌕" },
    { name: "Scan History", icon: "◷" },
    { name: "Security Center", icon: "⬡" },
  ];

  async function handleScan(event) {
    event.preventDefault();

    if (!target.trim()) {
      setError("Please enter a URL, email, or target to scan.");
      return;
    }

    setScanning(true);
    setError("");
    setResult(null);

    try {
      const data = await scanTarget(target.trim(), assetType);
      setResult(data);
      setHistory((previous) => [
        {
          target: target.trim(),
          type: assetType,
          result: data,
          time: new Date().toLocaleString(),
        },
        ...previous,
      ]);
    } catch (err) {
      setError(err.message || "Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  function openScanner() {
    setActivePage("Threat Scanner");
    setResult(null);
    setError("");
  }

  const displayName = user?.name || user?.email || "Security Analyst";

  return (
    <div className="vd-app">
      <aside className="vd-sidebar">
        <div className="vd-brand">
          <div className="vd-brand-icon">V</div>
          <div>
            <h2>VYDRAX</h2>
            <span>CYBER DEFENSE</span>
          </div>
        </div>

        <div className="vd-menu-label">WORKSPACE</div>

        <nav className="vd-navigation">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`vd-nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="vd-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {activePage === item.name && (
                <span className="vd-active-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="vd-sidebar-bottom">
          <div className="vd-protection-card">
            <span className="vd-status-dot" />
            <div>
              <strong>Protection active</strong>
              <p>Scanner ready to use</p>
            </div>
          </div>

          <button
            type="button"
            className="vd-logout"
            onClick={onLogout}
          >
            <span>↪</span> Sign out
          </button>
        </div>
      </aside>

      <main className="vd-main">
        <header className="vd-topbar">
          <div className="vd-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="vd-user">
            <div className="vd-user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="vd-user-info">
              <strong>{displayName}</strong>
              <span>Security Analyst</span>
            </div>
          </div>
        </header>

        <div className="vd-content">
          {activePage === "Overview" && (
            <>
              <section className="vd-welcome">
                <div>
                  <span className="vd-eyebrow">SECURITY OVERVIEW</span>
                  <h1>Welcome back, {displayName.split(" ")[0]}.</h1>
                  <p>
                    Monitor your security workspace and scan suspicious
                    targets with VYDRAX.
                  </p>
                </div>

                <button
                  type="button"
                  className="vd-primary-button"
                  onClick={openScanner}
                >
                  + New scan
                </button>
              </section>

              <section className="vd-stats">
                <article className="vd-stat-card">
                  <div className="vd-stat-top">
                    <span>Total scans</span>
                    <span className="vd-stat-icon blue">⌕</span>
                  </div>
                  <h2>{history.length}</h2>
                  <p>Scans this session</p>
                </article>

                <article className="vd-stat-card">
                  <div className="vd-stat-top">
                    <span>High risk</span>
                    <span className="vd-stat-icon red">!</span>
                  </div>
                  <h2>
                    {
                      history.filter(
                        (item) =>
                          String(
                            item.result.risk_level ||
                              item.result.risk ||
                              ""
                          ).toLowerCase() === "high"
                      ).length
                    }
                  </h2>
                  <p>High-risk results</p>
                </article>

                <article className="vd-stat-card">
                  <div className="vd-stat-top">
                    <span>Low risk</span>
                    <span className="vd-stat-icon green">✓</span>
                  </div>
                  <h2>
                    {
                      history.filter(
                        (item) =>
                          String(
                            item.result.risk_level ||
                              item.result.risk ||
                              ""
                          ).toLowerCase() === "low"
                      ).length
                    }
                  </h2>
                  <p>Low-risk results</p>
                </article>

                <article className="vd-stat-card">
                  <div className="vd-stat-top">
                    <span>System status</span>
                    <span className="vd-stat-icon green">●</span>
                  </div>
                  <h2 className="vd-status-text">Ready</h2>
                  <p>API connection configured</p>
                </article>
              </section>

              <section className="vd-panel vd-quick-scan">
                <div className="vd-panel-heading">
                  <div>
                    <span className="vd-eyebrow">QUICK ACTION</span>
                    <h2>Scan a suspicious target</h2>
                    <p>
                      Enter a target to check it with the configured scanner.
                    </p>
                  </div>
                  <span className="vd-large-search">⌕</span>
                </div>

                <form className="vd-scan-form" onSubmit={handleScan}>
                  <label htmlFor="overview-target">Target to scan</label>
                  <div className="vd-input-row">
                    <input
                      id="overview-target"
                      type="text"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      placeholder="Enter URL, email, or suspicious text..."
                      required
                    />
                    <select
                      aria-label="Asset type"
                      value={assetType}
                      onChange={(event) => setAssetType(event.target.value)}
                    >
                      <option value="URL">URL</option>
                      <option value="Email">Email</option>
                      <option value="Text">Text</option>
                      <option value="Social Profile">Social Profile</option>
                    </select>
                    <button
                      className="vd-primary-button"
                      type="submit"
                      disabled={scanning}
                    >
                      {scanning ? "Scanning..." : "Run scan →"}
                    </button>
                  </div>
                </form>

                {error && <p className="vd-error">{error}</p>}
                {result && <ScanResult result={result} />}
              </section>

              <RecentScans history={history} />
            </>
          )}

          {activePage === "Threat Scanner" && (
            <section className="vd-panel vd-scanner-page">
              <span className="vd-eyebrow">THREAT ANALYSIS</span>
              <h1>Threat Scanner</h1>
              <p className="vd-page-description">
                Submit a target for a security risk assessment.
              </p>

              <form className="vd-scan-form" onSubmit={handleScan}>
                <label htmlFor="scanner-target">Target to scan</label>
                <input
                  id="scanner-target"
                  type="text"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="Enter a URL, email, or suspicious text"
                  required
                />

                <label htmlFor="scanner-type">Target type</label>
                <select
                  id="scanner-type"
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value)}
                >
                  <option value="URL">URL</option>
                  <option value="Email">Email</option>
                  <option value="Text">Text</option>
                  <option value="Social Profile">Social Profile</option>
                </select>

                <button
                  type="submit"
                  className="vd-primary-button"
                  disabled={scanning}
                >
                  {scanning ? "Analyzing target..." : "Analyze target →"}
                </button>
              </form>

              {error && <p className="vd-error">{error}</p>}
              {result && <ScanResult result={result} />}
              <p className="vd-disclaimer">
                This demo scanner uses the rules configured in your backend.
                Results are indicative, not a guarantee that a target is safe.
              </p>
            </section>
          )}

          {activePage === "Scan History" && (
            <section className="vd-panel">
              <span className="vd-eyebrow">ACTIVITY LOG</span>
              <h1>Scan History</h1>
              <p className="vd-page-description">
                Results from scans performed during this session.
              </p>
              <RecentScans history={history} />
            </section>
          )}

          {activePage === "Security Center" && (
            <section className="vd-panel">
              <span className="vd-eyebrow">SECURITY RESOURCES</span>
              <h1>Security Center</h1>
              <p className="vd-page-description">
                Practical reminders for safer online activity.
              </p>

              <div className="vd-security-grid">
                <article className="vd-security-tip">
                  <span>01</span>
                  <h3>Verify links</h3>
                  <p>
                    Check the complete domain before opening unfamiliar links.
                  </p>
                </article>
                <article className="vd-security-tip">
                  <span>02</span>
                  <h3>Protect credentials</h3>
                  <p>
                    Never share passwords or one-time passcodes with anyone.
                  </p>
                </article>
                <article className="vd-security-tip">
                  <span>03</span>
                  <h3>Question urgency</h3>
                  <p>
                    Unexpected prizes, threats, and urgent requests deserve
                    extra verification.
                  </p>
                </article>
                <article className="vd-security-tip">
                  <span>04</span>
                  <h3>Use trusted sources</h3>
                  <p>
                    Confirm important messages using the organization's
                    official contact details.
                  </p>
                </article>
              </div>
            </section>
          )}
        </div>

        <footer className="vd-footer">
          <span>VYDRAX Cyber Defense Platform</span>
          <span>Security demo · Use results as guidance only</span>
        </footer>
      </main>
    </div>
  );
}

function ScanResult({ result }) {
  const risk = String(
    result.risk_level || result.risk || "Unknown"
  ).toLowerCase();

  const riskClass = ["high", "medium", "low"].includes(risk)
    ? risk
    : "unknown";

  return (
    <section className="vd-result">
      <div className="vd-result-heading">
        <div>
          <span className="vd-eyebrow">SCAN RESULT</span>
          <h3>Risk assessment</h3>
        </div>
        <span className={`vd-risk-badge ${riskClass}`}>
          {risk.toUpperCase()} RISK
        </span>
      </div>

      {result.target && (
        <p className="vd-result-target">
          <strong>Target:</strong> {result.target}
        </p>
      )}

      {result.score !== undefined && (
        <p>
          <strong>Risk score:</strong> {result.score}
        </p>
      )}

      <p>
        {result.message ||
          result.reason ||
          result.description ||
          "The backend returned a scan result."}
      </p>

      {Array.isArray(result.reasons) && result.reasons.length > 0 && (
        <ul>
          {result.reasons.map((reason, index) => (
            <li key={`${index}-${reason}`}>{String(reason)}</li>
          ))}
        </ul>
      )}

      <p className="vd-disclaimer">
        This is a heuristic demo result, not a definitive security verdict.
      </p>
    </section>
  );
}

function RecentScans({ history }) {
  return (
    <section className="vd-panel vd-history-panel">
      <div className="vd-panel-heading">
        <div>
          <span className="vd-eyebrow">RECENT ACTIVITY</span>
          <h2>Recent scans</h2>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="vd-empty-state">
          <span>⌕</span>
          <strong>No scans yet</strong>
          <p>Your recent scan activity will appear here.</p>
        </div>
      ) : (
        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Type</th>
                <th>Risk</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => {
                const risk = String(
                  item.result.risk_level || item.result.risk || "Unknown"
                );

                return (
                  <tr key={`${item.time}-${index}`}>
                    <td>{item.target}</td>
                    <td>{item.type}</td>
                    <td>
                      <span
                        className={`vd-risk-badge ${risk.toLowerCase()}`}
                      >
                        {risk}
                      </span>
                    </td>
                    <td>{item.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Dashboard;