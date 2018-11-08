const path = require("path");
const {Database, Terminal} = require(path.join(__dirname, ".."));

let term = new Terminal({terminal: process.argv[2]});

term.on("key", function(key, value) {
  if (key.startsWith("_")) {
    return;
  }

  term.write(`\nkey ${JSON.stringify(key).replace(/(?:^")|(?:"$)/g, "")}, ${JSON.stringify(value).replace(/(?:^")|(?:"$)/g, "")}`);

  if (key === "CTRL_C" || key === "CTRL_D") {
    term.setMouseMode(false);
    term.setScrollRegion();
    term.setAlternateBuffer(false);
    term.close();
    
    process.exit(0);
  }
});

term.on("click", function(event) {
  term.setForeground(term.colors.RED);
  term.write(`\nclick (${event.button}) ${event.x}, ${event.y} ${event.meta ? "~" : ""}${event.ctrl ? "^" : ""}${event.shift ? "!" : ""}`);

  term.resetForeground();
  term.saveCursor();
  term.moveTo(0, 0);
  term.setBackground(term.colors.RED);
  term.write(" ".repeat(10));
  term.moveBy(-10);
  term.write(Database.format("(%p1%s) %p2%s,%p3%s", event.button, event.x, event.y));
  term.restoreCursor();
  term.resetBackground();
});

term.on("mouse", function(event) {
  term.setForeground(term.colors.GREEN);
  term.write(`\nmouse (${event.button}) ${event.x}, ${event.y} ${event.meta ? "~" : ""}${event.ctrl ? "^" : ""}${event.shift ? "!" : ""}`);

  term.resetForeground();
  term.saveCursor();
  term.moveTo(10, 0);
  term.setBackground(term.colors.GREEN);
  term.write(" ".repeat(10));
  term.moveBy(-10);
  term.write(Database.format("(%p1%s) %p2%s,%p3%s", event.button, event.x, event.y));
  term.restoreCursor();
  term.resetBackground();
});

term.on("scroll", function(event) {
  term.setForeground(term.colors.BLUE);
  term.write(`\nscroll (${event.button}) ${event.x}, ${event.y} ${event.meta ? "~" : ""}${event.ctrl ? "^" : ""}${event.shift ? "!" : ""}`);

  term.resetForeground();
  term.saveCursor();
  term.moveTo(20, 0);
  term.setBackground(term.colors.BLUE);
  term.write(" ".repeat(10));
  term.moveBy(-10);
  term.write(Database.format("(%p1%s) %p2%s,%p3%s", event.button, event.x, event.y));
  term.restoreCursor();
  term.resetBackground();
});

term.on("resize", function(columns, rows) {
  term.saveCursor();
  term.setScrollRegion(1, term.rows);
  term.restoreCursor();
  // term.scrollBy(-1);
  term.setForeground(term.colors.PURPLE);
  term.write(`\nresize ${columns}, ${rows}`);

  term.resetForeground();
  term.saveCursor();
  term.moveTo(30, 0);
  term.setBackground(term.colors.PURPLE);
  term.write(" ".repeat(10));
  term.moveBy(-10);
  term.write(Database.format(" %p1%s,%p2%s", columns, rows));
  term.restoreCursor();
  term.resetBackground();
});

term.setAlternateBuffer(true);
term.clearScreen();
term.setScrollRegion(1, term.rows);
term.setMouseMode(true);

term.setBackground(term.colors.RED);
term.write(" click    ");
term.setBackground(term.colors.GREEN);
term.write(" mouse    ");
term.setBackground(term.colors.BLUE);
term.write(" scroll   ");
term.setBackground(term.colors.PURPLE);
term.write(" resize   ");
term.resetBackground();
// term.write("\n");

term.open();
