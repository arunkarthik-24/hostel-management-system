import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import "./DashboardHeader.css";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaHome,
  FaUsers,
  FaMoneyBillWave,
  FaDoorOpen,
  FaSignOutAlt,
  FaUserPlus,
  FaTools
} from "react-icons/fa";


function AdminDashboard() {
  // ===== DASHBOARD DATA =====
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  // ===== ADD ROOM STATES =====
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rent, setRent] = useState("");

  // ===== ASSIGN ROOM STATES =====
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [complaints, setComplaints] = useState([]);


  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ===== ADD ROOM =====
  const handleAddRoom = () => {
    if (!roomNumber || !capacity || !rent) {
      alert("Please fill all room fields");
      return;
    }

    fetch("http://localhost:5000/add-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ roomNumber, capacity, rent })
    })
      .then(res => res.json())
      .then(() => {
        alert("Room added successfully");
        window.location.reload();
      });
  };

  // ===== ASSIGN ROOM =====
  const handleAssignRoom = () => {
    if (!selectedTenant || !selectedRoom) {
      alert("Please select both tenant and room");
      return;
    }

    fetch("http://localhost:5000/assign-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        tenantId: selectedTenant,
        roomId: selectedRoom
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        window.location.reload();
      })
      .catch(() => alert("Failed to assign room"));
  };

  // ===== FETCH DATA =====
  useEffect(() => {
    fetch("http://localhost:5000/admin-dashboard", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => setStats(data));

    fetch("http://localhost:5000/rooms")
      .then(res => res.json())
      .then(data => setRooms(data));
    
    fetch("http://localhost:5000/all-complaints")
    .then(res => res.json())
    .then(data => setComplaints(Array.isArray(data) ? data : []));

    fetch("http://localhost:5000/tenants", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => setTenants(Array.isArray(data) ? data : []));
  }, [token]);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="admin-page">
      <div className="pg-header">
  <h1>MAJABOYS PG</h1>
  <p>Hostel & PG Management System</p>
</div>
      <h2>Admin Dashboard</h2>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        <FaSignOutAlt /> Logout
      </button>

      {/* ===== DASHBOARD CARDS ===== */}
      <div className="card-container">
  <div className="dashboard-card fade-slide delay-1">
    <FaBed size={30} />
    <h3>Total Rooms</h3>
    <p>{stats.totalRooms}</p>
  </div>

  <div className="dashboard-card fade-slide delay-2">
    <FaDoorOpen size={30} />
    <h3>Available Rooms</h3>
    <p>{stats.availableRooms}</p>
  </div>

  <div className="dashboard-card fade-slide delay-3">
    <FaUsers size={30} />
    <h3>Total Tenants</h3>
    <p>{stats.totalTenants}</p>
  </div>

  <div className="dashboard-card fade-slide delay-4">
    <FaMoneyBillWave size={30} />
    <h3>Total Rent Collected</h3>
    <p>₹ {stats.totalRentCollected}</p>
  </div>
</div>


      {/* ===== ADD ROOM ===== */}
     <h3 className="section-title">
  <FaBed /> Add Room
</h3>



      <input
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      /><br /><br />

      <input
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      /><br /><br />

      <input
        placeholder="Rent"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
      /><br /><br />

      <button className="primary-btn" onClick={handleAddRoom}>
  Add Room
</button>


      <hr />

      {/* ===== ROOMS TABLE ===== */}
      <h3 className="section-title">
  <FaHome /> Rooms
</h3>

      <table>
        <thead>
          <tr>
            <th>Room No</th>
            <th>Capacity</th>
            <th>Occupied</th>
            <th>Rent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room._id}>
              <td>{room.roomNumber}</td>
              <td>{room.capacity}</td>
              <td>{room.occupiedBeds}</td>
              <td>₹ {room.rent}</td>
              <td>{room.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* ===== ASSIGN TENANT TO ROOM ===== */}
      <h3 className="section-title">
  <FaUserPlus /> Assign Tenant to Room
</h3>


      <select
        value={selectedTenant}
        onChange={(e) => setSelectedTenant(e.target.value)}
      >
        <option value="">Select Tenant</option>
        {tenants
          .filter(t => !t.roomId)   // 🔥 only unassigned tenants
          .map(t => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
      </select>

      <br /><br />

      <select
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Select Room</option>
        {rooms
          .filter(r => r.status !== "Full")
          .map(r => (
            <option key={r._id} value={r._id}>
              Room {r.roomNumber}
            </option>
          ))}
      </select>

      <br /><br />

      <button onClick={handleAssignRoom}>Assign Room</button>

      <hr />

      {/* ===== TENANTS TABLE ===== */}
      <h3 className="section-title">
  <FaUsers /> Tenants
</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t._id}>
              <td>{t.name}</td>
              <td>{t.phone || "-"}</td>
              <td>{t.roomId ? t.roomId.roomNumber : "Not Assigned"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

<h3 className="section-title">
  <FaTools /> Tenant Complaints
</h3>


<table>
  <thead>
    <tr>
      <th>Tenant</th>
      <th>Room</th>
      <th>Issue</th>
      <th>Description</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {complaints.length === 0 ? (
      <tr>
        <td colSpan="6">No complaints found</td>
      </tr>
    ) : (
      complaints.map(c => (
        <tr key={c._id}>
          <td>{c.tenantId?.name}</td>
          <td>{c.roomId?.roomNumber || "-"}</td>
          <td>{c.issueType}</td>
          <td>{c.description}</td>
          <td>{c.status}</td>
          <td>
            <select
              value={c.status}
              onChange={(e) => {
                fetch(
                  `http://localhost:5000/update-complaint/${c._id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      status: e.target.value
                    })
                  }
                ).then(() => window.location.reload());
              }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

    </div>
  );
}

export default AdminDashboard;
