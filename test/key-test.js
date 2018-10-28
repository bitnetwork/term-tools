const path = require("path");
const {Terminal} = require(path.join(__dirname, ".."));

let term = new Terminal({terminal: process.argv[2]});

term.on("key", function(key, value) {
  console.dir(["key", key, value]);

  if (key === "CTRL_C" || key === "CTRL_D") {
    // console.log("exiting...")
    term.setMouseMode(false);
    term.close();
    // console.log("now unrawed")
    process.exit(0);
    // console.log("this shouldn't happen")
  }
});

term.on("click", function(event) {
  console.dir(["click", event.x, event.y, event.button, event.meta, event.ctrl, event.shift]);
});

term.on("mouse", function(event) {
  console.dir(["mouse", event.x, event.y, event.button, event.meta, event.ctrl, event.shift]);
});

term.on("scroll", function(event) {
  console.dir(["scroll", event.x, event.y, event.button, event.meta, event.ctrl, event.shift]);
});

term.on("resize", function(columns, rows) {
  console.dir(["resize", columns, rows]);
});

term.setMouseMode(true);
term.open();
