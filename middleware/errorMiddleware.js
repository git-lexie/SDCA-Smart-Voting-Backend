const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  // If response was already sent, delegate to Express's default handler
  if (res.headersSent) {
    return next(error);
  }

  // Default to 500 Internal Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: error.message || "An unknown error occurred.",
  });
};

module.exports = { notFound, errorHandler };