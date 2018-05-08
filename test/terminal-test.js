const Terminal = require("..").Terminal;

let term = new Terminal({terminal: process.argv[3] || process.env.TERM || "xterm"});

term.open();

console.log(term);

process.exit(0);