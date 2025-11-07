class HttpError extends Error {
constructor(message, code) {
super(message);
this.name = this.constructor.name; // preserve class name
this.code = code || 500;           // default to 500 if no code provided
Error.captureStackTrace(this, this.constructor); // proper stack trace
}
}

module.exports = HttpError;