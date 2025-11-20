class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || "Internal Server Error" });
};

module.exports = { HttpError, notFound, errorHandler };
