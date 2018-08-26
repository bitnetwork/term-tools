const Database = require("./database.js");
const Terminal = require("./terminal.js");

const errors = require("./errors.js");

module.exports = {
  Database: Database,
  Terminal: Terminal,

  NotFoundError: errors.NotFoundError
};
