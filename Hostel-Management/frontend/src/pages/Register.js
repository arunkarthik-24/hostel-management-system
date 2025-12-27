import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "tenant"
      })
    }).then(() => {
      alert("Registration successful");
      navigate("/");
    });
  };

  return (
    <div className="register-page fade-in">
      <div className="register-card slide-up">

        <h1 className="pg-title">MAJABOYS PG</h1>
        <p className="pg-subtitle">Tenant Registration</p>

        <h2>Register</h2>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

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

        <button onClick={handleRegister}>
          <FaUserPlus /> Create Account
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
