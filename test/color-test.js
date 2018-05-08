const Terminal = require("..").Terminal;

let term = new Terminal({terminal: process.argv[2] || process.env.TERM || "xterm"});

console.log(process.argv);

term.reset();

if (typeof process.argv[3] === "string") {
  term.write(term.configureColor(15, process.argv[3]) + term.setForegroundColor(15) + process.argv[2]);
} else {
  for (let i = 0; i <= 255; i++) {
    term.write(term.setForegroundColor(i) + ("0".repeat(3 - i.toString().length)) + i + " ");
  }
}
term.write("\n");

process.exit(0);