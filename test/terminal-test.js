const Terminal = require("..").Terminal;

let term = new Terminal({terminal: process.argv[2]});

console.log(process.argv[2]);
// term.write(`${term.changeScreen()}Testing terminal module...\n\
// ${term.cursorVisible(false)}Cursor now invisible.\n\
// ${term.moveRelative(0, -5)}Now moved 5 lines up.`);

term.open();

term.on("key", function(value, mapping) {
  let output = "";
  for (let i = 0; i < value.length; i++) {
    output += value.charCodeAt(i) + (i < value.length - 1 ? ", " : "");
  }
  
  console.log(`caught: ${mapping === null ? value : mapping} [${output}]`);

  if (value == term.KEY_CTRL_C) {
    term.close();
    process.exit(0);
  }
});