import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("userId", data.userId);

          if (data.role === "admin") navigate("/admin");
          else navigate("/tenant");
        } else {
          alert("Invalid credentials");
        }
      });
  };

  return (
    <div className="login-page fade-in">
      <div className="login-card slide-up">

        <h1 className="pg-title">MAJABOYS PG</h1>
        <p className="pg-subtitle">Hostel & PG Management System</p>

        <h2>Login</h2>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleLogin}>
          <FaSignInAlt /> Login
        </button>

        <p className="register-text">
          New tenant?{" "}
          <span onClick={() => navigate("/register")}>Register here</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
