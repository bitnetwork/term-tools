const Terminal = require("..").Terminal;

let term = new Terminal({terminal: process.argv[2] || process.env.TERM || "xterm"});

console.log(process.argv);

term.reset();

term.write("normal\n");
term.write(term.setStyle({standout: true}) + "standout\n");
term.write(term.setStyle({underline: true}) + "underline\n");
term.write(term.setStyle({reverse: true}) + "reverse\n");
term.write(term.setStyle({blink: true}) + "blink\n");
term.write(term.setStyle({dim: true}) + "dim\n");
term.write(term.setStyle({bold: true}) + "bold\n");
term.write(term.setStyle({invisible: true}) + "invisible\n");
term.write(term.setStyle({protect: true}) + "protect\n");
term.write(term.setStyle({altcharset: true}) + "altcharset\n");

term.write("\n");

try {
  term.write(term.setStyle({horizontal: true}) + "horizontal\n");
  term.write(term.setStyle({left: true}) + "left\n");
  term.write(term.setStyle({low: true}) + "low\n");
  term.write(term.setStyle({right: true}) + "right\n");
  term.write(term.setStyle({top: true}) + "top\n");
  term.write(term.setStyle({vertical: true}) + "vertical\n");
} catch (error) {
  if (error.name === "NotCapable") {
    term.write(term.setStyle() + "Terminal not capable of advanced styles\n")
  }
}

term.write("\n");

try {
  term.write(term.setStyle({italic: true}) + "italic\n");
} catch (error) {
  if (error.name === "NotCapable") {
    term.write(term.setStyle() + "Terminal not capable of italics\n");
  }
}

term.write(term.setStyle());

process.exit(0);