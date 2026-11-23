import { useState } from "react";
import Login from "./pages/Login";
import LecturerDashboard from "./components/lecturer/LecturerDashboard";
import StudentPortal from "./Student/StudentPortal";

export default function App() {
  const [user, setUser] = useState(null);

  if (user === null) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div>
      <div style={{ padding: "8px 16px", background: "#fff1e0", color: "#4a2c1a" }}>
        {user.full_name} ({user.role}){" "}
        <button onClick={() => setUser(null)}>Log out</button>
      </div>

      {user.role === "lecturer" && <LecturerDashboard user={user} />}
      {user.role === "student" && <StudentPortal user={user} />}
      {user.role === "admin" && <p style={{ padding: 16 }}>Admin page coming soon.</p>}
    </div>
  );
}