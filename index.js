require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./src/routes/Routes");
const { notFound, errorHandler } = require("./src/middleware/error-middleware");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
