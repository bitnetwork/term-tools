const path = require("path");
const {Database, Terminal} = require(path.join(__dirname, ".."));

let term = new Terminal({terminal: process.argv[2]});

for (let i = 0; i <= 255; i++) {
  term.setBackground(i);
  term.write(Database.format("%p1%.3d", i));
  term.resetBackground();

  if (i === 7 || i === 15 || (i > 15 && i < 232 && (i - 15) % 6 === 0) || i === 243 ||i === 255) {
    term.write("\n");
  }
}

for (let i = 1; i <= 40; i++) {
  let color = [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)
  ];
  term.setBackgroundTrue(color);
  term.write(Database.format("%p1%.2x%p2%.2x%p3%.3x", ...color));
  term.resetBackground();

  if (i % 5 === 0) {
    term.write("\n");
  }
}

process.exit(0);