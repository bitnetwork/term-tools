class NamedError extends Error {
  constructor(name = "Error", ...args) {
    super(...args);
    this.name = name;
    // Error.captureStackTrace(this, NamedError);
  }
}

module.exports = NamedError;