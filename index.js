const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");
const { connect } = require("mongoose");
require("dotenv").config();

const Routes = require("./routes/Routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));

// Routes
app.use("/api", Routes);

// admin Routes
app.use("/api/admin", adminRoutes);

// result Routes
app.use("/api/results", require("./routes/resultRoutes"));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB, then start server
connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server started on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));