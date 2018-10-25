const path = require("path");
const {Terminal} = require(path.join(__dirname, ".."));

let term = new Terminal({terminal: process.argv[2]});

for (let i = 0; i <= 255; i++) {
  term.setBackground(i);
  term.write(term.database.format("%p1%.3d", i));
  term.resetBackground();

  if (i === 7 || i === 15 || (i > 15 && i < 232 && (i - 15) % 6 === 0) || i === 243 ||i === 255) {
    term.write("\n");
  }
}

process.exit(0);