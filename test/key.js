let path = require("path");
let termtools = require(path.join(__dirname, ".."));

let terminal = new termtools.Terminal({terminal: process.argv[2]});
terminal.stdin.setRawMode(true);

//terminal.on("data", function(data) {
process.stdin.on("data", function(data) {
  if (typeof data === "string") {
    data = new Buffer(data);
  }
  console.log(data);
  
  //for (let i = 0; i < data.length; i++) {
  //  terminal.write(`${data[i]} > ${String.fromCharCode(data[i])}\n`);
  //}

  if (data[0] === 3) { // ctrl-c
    process.exit(0);
  }
});
