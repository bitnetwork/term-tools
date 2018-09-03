class NotFoundError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class InconsistentError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  NotFoundError: NotFoundError,
  InconsistentError: InconsistentError
};