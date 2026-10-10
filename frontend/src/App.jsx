
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = localStorage.getItem("riskshield_token");

      if (!token) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        logoutUser();
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser(name.trim(), email.trim(), password);
      }

      const response = await loginUser(email.trim(), password);
      setUser(response.user);
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setPassword("");
    setError("");
    setMode("login");
  }

  if (checkingSession) {
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <p>Loading VYDRAX...</p>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-symbol">V</div>
          <div>
            <h1>VYDRAX</h1>
            <p className="brand-subtitle">CYBER DEFENSE PLATFORM</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">SECURE ACCESS</span>

          <h2>
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to access your security dashboard."
              : "Register to start using VYDRAX."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                maxLength={100}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === "register"
                  ? "At least 8 characters"
                  : "Enter your password"
              }
              minLength={mode === "register" ? 8 : 1}
              maxLength={128}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
            />
          </label>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default App;
