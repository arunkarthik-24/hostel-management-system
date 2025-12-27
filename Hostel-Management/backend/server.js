const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Room = require("./models/Room");
const Tenant = require("./models/Tenant");
const Payment = require("./models/Payment");
const Complaint = require("./models/Complaint");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => {
  res.send("Hostel Management Backend Running");
});

app.post("/add-room", async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.json({ message: "Room added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-tenant", async (req, res) => {
  try {
    const tenant = new Tenant({
      name: req.body.name,
      phone: req.body.phone
    });

    await tenant.save();
    res.json({ message: "Tenant added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/allocate-room", async (req, res) => {
  try {
    const { tenantId, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ message: "Room is already full" });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    tenant.roomId = roomId;
    await tenant.save();

    room.occupiedBeds += 1;
    if (room.occupiedBeds === room.capacity) {
      room.status = "Full";
    }

    await room.save();

    res.json({ message: "Tenant allocated to room successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tenants", async (req, res) => {
  try {
    const tenants = await Tenant.find().populate("roomId");
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/pay-rent", async (req, res) => {
  try {
    const { tenantId, month, amount } = req.body;

    const payment = new Payment({
      tenantId,
      month,
      amount
    });

    await payment.save();

    res.json({ message: "Rent payment recorded successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/rent-history/:tenantId", async (req, res) => {
  try {
    const payments = await Payment.find({
      tenantId: req.params.tenantId
    }).sort({ paymentDate: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/monthly-rent/:month", async (req, res) => {
  try {
    const payments = await Payment.find({
      month: req.params.month,
      status: "Paid"
    });

    let total = 0;
    payments.forEach(p => {
      total += p.amount;
    });

    res.json({
      month: req.params.month,
      totalCollected: total,
      payments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update-rent-status/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = req.body.status; // Paid / Pending
    await payment.save();

    res.json({ message: "Payment status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin-dashboard", async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: "Available" });
    const totalTenants = await Tenant.countDocuments();

    const paidPayments = await Payment.find({ status: "Paid" });
    let totalRentCollected = 0;
    paidPayments.forEach(p => {
      totalRentCollected += p.amount;
    });

    const pendingPayments = await Payment.countDocuments({ status: "Pending" });

    res.json({
      totalRooms,
      availableRooms,
      totalTenants,
      totalRentCollected,
      pendingPayments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/raise-complaint", async (req, res) => {
  try {
    const { tenantId, roomId, issueType, description } = req.body;

    const complaint = new Complaint({
      tenantId,
      roomId,
      issueType,
      description
    });

    await complaint.save();

    res.json({ message: "Complaint raised successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("tenantId", "name phone")
      .populate("roomId", "roomNumber");

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints/:tenantId", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      tenantId: req.params.tenantId
    }).populate("roomId", "roomNumber");

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update-complaint/:complaintId", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = req.body.status; // Open / In Progress / Closed
    await complaint.save();

    res.json({ message: "Complaint status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1️⃣ Create login user
    const user = new User({ name, email, password, role });
    await user.save();

    // 2️⃣ Create tenant profile if role is tenant
    if (role === "tenant") {
      const tenant = new Tenant({
        userId: user._id,
        name: name,
        phone: "",
        roomId: null
      });
      await tenant.save();
    }

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
  token,
  role: user.role,
  userId: user._id   
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/assign-room", async (req, res) => {
  try {
    const { tenantId, roomId } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ message: "Room is already full" });
    }

    // Assign room to tenant
    await Tenant.findByIdAndUpdate(tenantId, {
      roomId: roomId
    });

    // Update room occupancy
    room.occupiedBeds += 1;
    room.status =
      room.occupiedBeds >= room.capacity ? "Full" : "Available";

    await room.save();

    res.json({ message: "Room assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tenant-by-user/:userId", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      userId: req.params.userId
    }).populate("roomId");

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update-tenant/:tenantId", async (req, res) => {
  try {
    const { name, phone } = req.body;

    await Tenant.findByIdAndUpdate(req.params.tenantId, {
      name,
      phone
    });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get("/all-payments", async (req, res) => {
  const payments = await Payment.find()
    .populate("tenantId");
  res.json(payments);
});

app.put("/approve-rent/:paymentId", async (req, res) => {
  await Payment.findByIdAndUpdate(req.params.paymentId, {
    status: "Paid"
  });
  res.json({ message: "Rent approved" });
});

app.post("/migrate-users-to-tenants", async (req, res) => {
  try {
    // 1️⃣ Get all tenant users
    const users = await User.find({ role: "tenant" });

    let createdCount = 0;

    for (let user of users) {
      // 2️⃣ Check if tenant already exists
      const existingTenant = await Tenant.findOne({
        userId: user._id
      });

      // 3️⃣ If not exists, create tenant
      if (!existingTenant) {
        await Tenant.create({
          userId: user._id,
          name: user.name,
          phone: "",
          roomId: null
        });
        createdCount++;
      }
    }

    res.json({
      message: "Migration completed",
      tenantsCreated: createdCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/all-complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("tenantId")
      .populate("roomId");

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/update-complaint/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, {
      status: req.body.status
    });

    res.json({ message: "Complaint updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});

