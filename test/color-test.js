const Terminal = require("..").Terminal;

let term = new Terminal({terminal: process.argv[2] || process.env.TERM || "xterm"});

console.log(process.argv);

term.reset();

if (typeof process.argv[3] === "string") {
  term.write(term.configureColor(16, process.argv[3]) + term.setForegroundColor(16) + process.argv[3]);
} else {

  // First 16 colors are system colors, for 8-bit and 16-bit color terminals
  term.write("System\n");
  for (let i = 0; i <= Math.min(term.terminfo.MAX_COLORS, 15); i++) {
    if (i === 8) {
      term.write("\n");
    }
  
    term.write(term.setForegroundColor(i) + ("0".repeat(3 - i.toString().length)) + i + " ");
  }

  // Next 6*6*6 colors are groups of 36 color cubes, for 256-color terminals
  term.write(term.setForegroundColor(7) + "\n\n6x6x6 Cubes");
  for (let i = 16; i <= Math.min(term.terminfo.MAX_COLORS, 231); i++) {
    if ((i - 16) % 36 === 0 && i !== 16) {
      term.write("\n\n")
    } else if ((i - 16) % 6 === 0) {
      term.write("\n");
    }
    
    term.write(term.setForegroundColor(i) + ("0".repeat(3 - i.toString().length)) + i + " ");
  }
  
  // Last 24 colors are grayscale colors, for 256-color terminals
  term.write(term.setForegroundColor(7) + "\n\nGrayscale")
  for (let i = 232; i <= Math.min(term.terminfo.MAX_COLORS, 255); i++) {
    if ((i - 232) % 8 === 0) {
      term.write("\n");
    }
  
    term.write(term.setForegroundColor(i) + ("0".repeat(3 - i.toString().length)) + i + " ");
  }
}
term.write("\n");

process.exit(0);