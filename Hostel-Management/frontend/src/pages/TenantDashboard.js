import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css";
import {
  FaHome,
  FaMoneyCheckAlt,
  FaTools,
  FaSignOutAlt
} from "react-icons/fa";

function TenantDashboard() {
  const [tenant, setTenant] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ===== LOAD TENANT DATA =====
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/tenant-by-user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setTenant(data);

        // ✅ PREFILL EDIT PROFILE FIELDS
        setName(data.name);
        setPhone(data.phone || "");

        // ----- RENT HISTORY (SAFE) -----
        fetch(`http://localhost:5000/rent-history/${data._id}`)
          .then(res => res.json())
          .then(d => setPayments(Array.isArray(d) ? d : []));

        // ----- COMPLAINTS (SAFE) -----
        fetch(`http://localhost:5000/complaints/${data._id}`)
          .then(res => res.json())
          .then(d => setComplaints(Array.isArray(d) ? d : []));
      })
      .catch(() => alert("Failed to load tenant data"));
  }, [userId]);

  // ===== UPDATE PROFILE =====
  const handleUpdateProfile = () => {
    if (!name) {
      alert("Name cannot be empty");
      return;
    }

    fetch(`http://localhost:5000/update-tenant/${tenant._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone
      })
    })
      .then(res => res.json())
      .then(() => alert("Profile updated successfully"))
      .catch(() => alert("Failed to update profile"));
  };

  // ===== SUBMIT COMPLAINT =====
  const handleComplaint = () => {
    if (!issue || !description) {
      alert("Please fill all fields");
      return;
    }

    fetch("http://localhost:5000/raise-complaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tenantId: tenant._id,
        roomId: tenant.roomId?._id,
        issueType: issue,
        description
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Complaint submitted successfully");
        setIssue("");
        setDescription("");

        // Reload complaints
        fetch(`http://localhost:5000/complaints/${tenant._id}`)
          .then(res => res.json())
          .then(d => setComplaints(Array.isArray(d) ? d : []));
      })
      .catch(() => alert("Failed to submit complaint"));
  };

  if (!tenant) {
    return <p>Loading tenant dashboard...</p>;
  }

  return (
    <div className="dashboard-container">
      <div className="pg-header">
  <h1>MAJABOYS PG</h1>
  <p>Hostel & PG Management System</p>
</div>
      <h2>Tenant Dashboard</h2>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        <FaSignOutAlt /> Logout
      </button>

      {/* ===== ROOM DETAILS ===== */}
      <h3 className="section-title">
        <FaHome /> Room Details
      </h3>

      <div className="section">
        <p><b>Room:</b> {tenant.roomId ? tenant.roomId.roomNumber : "Not Assigned"}</p>
        <p><b>Rent:</b> ₹ {tenant.roomId ? tenant.roomId.rent : "-"}</p>
      </div>

      {/* ===== EDIT PROFILE ===== */}
      <h3 className="section-title">
        <FaHome /> Edit Profile
      </h3>

      <input
        placeholder="Update Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Update Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <button onClick={handleUpdateProfile}>
        Update Profile
      </button>

      {/* ===== RENT HISTORY ===== */}
      <h3 className="section-title">
        <FaMoneyCheckAlt /> Rent History
      </h3>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="3">No rent records found</td>
            </tr>
          ) : (
            payments.map(p => (
              <tr key={p._id}>
                <td>{p.month}</td>
                <td>₹ {p.amount}</td>
                <td
                  className={
                    p.status === "Paid"
                      ? "status-paid"
                      : "status-pending"
                  }
                >
                  {p.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== RAISE COMPLAINT ===== */}
      <h3 className="section-title">
        <FaTools /> Raise Complaint
      </h3>

      <input
        placeholder="Issue type (Water, Electricity, etc.)"
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Describe the issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={handleComplaint}>
        Submit Complaint
      </button>

      {/* ===== COMPLAINT LIST ===== */}
      <h3 className="section-title">
        <FaTools /> My Complaints
      </h3>

      <table>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan="3">No complaints found</td>
            </tr>
          ) : (
            complaints.map(c => (
              <tr key={c._id}>
                <td>{c.issueType}</td>
                <td>{c.description}</td>
                <td
                  className={
                    c.status === "Closed"
                      ? "complaint-closed"
                      : "complaint-open"
                  }
                >
                  {c.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TenantDashboard;
