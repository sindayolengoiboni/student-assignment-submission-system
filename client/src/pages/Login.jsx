import { useState } from "react";
import "./Login.css";

export default function Login() {
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
    setError("");
    setMessage("");
  }

  function handleSubmit(e) {
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
      setError("");
      console.log("Sign up:", role, name, email); // backend comes later
      setMessage("Account created! You can now log in.");
      setIsSignUp(false);
      return;
    }

    setError("");
    console.log("Login:", role, email); // backend comes later
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>Student Submission</h1>
        <h2>{isSignUp ? "Create an account" : "Login"}</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>

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