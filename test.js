let term = new (require("./index.js"))();
term.clear();
term.moveAbs(0, 0);
term.write("hey ;)")
term.stdin.on("data", function(data) {
  if (data[0] === 0x3) process.exit(0);
  console.log(new Buffer(data)[0] + " - " + term._parseKey(data));
});
