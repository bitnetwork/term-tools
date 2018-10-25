const path = require("path");
const {Terminal} = require(path.join(__dirname, ".."));

let term = new Terminal({terminal: process.argv[2]});
term.open();

term.on("key", function(key, value) {
  console.dir([key, value]);

  if (key === "CTRL_C" || key === "CTRL_D") {
    // console.log("exiting...")
    term.close();
    // console.log("now unrawed")
    process.exit(0);
    // console.log("this shouldn't happen")
  }
});