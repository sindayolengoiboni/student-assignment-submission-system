import { useState } from "react";
import "./Login.css";

const API = "http://127.0.0.1:5000";

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function switchMode() {
    setIsSignUp(!isSignUp);
    setRole("student");
    setError("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (email === "" || password === "") {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp) {
      if (name === "") {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      const url = isSignUp ? "/api/register" : "/api/login";
      const body = isSignUp
        ? { full_name: name, email, password, role }
        : { email, password };

      const response = await fetch(API + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setError("");
      if (isSignUp) {
        setMessage("Account created! You can now log in.");
        setIsSignUp(false);
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError("Cannot reach the server. Is it running?");
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>Student Submission</h1>
        <h2>{isSignUp ? "Create an account" : "Login"}</h2>

        {isSignUp && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        )}

        {isSignUp && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}

        <p className="error">{error}</p>
        <p className="success">{message}</p>

        <button type="submit">{isSignUp ? "Sign up" : "Log in"}</button>

        <p className="switch">
          {isSignUp ? "Already have an account? " : "No account yet? "}
          <button type="button" className="link" onClick={switchMode}>
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
}