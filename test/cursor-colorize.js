const path = require("path");
const minimist = require("minimist");
const {Terminal} = require(path.join(__dirname, ".."));

let options = minimist(process.argv.slice(2), {
  string: "terminal",
  alias: {term: "terminal", t: "terminal"}
});

let term = new Terminal({terminal: options.terminal});

term.setCursorColor(...options._);

process.exit(0);