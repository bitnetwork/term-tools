const Terminal = require("..").Terminal;

let term = new Terminal();

term.open();
term.write(`${term.changeScreen()}Testing terminal module...\n\
${term.cursorVisible(false)}Cursor now invisible.\n\
${term.moveRelative(0, -5)}Now moved 5 lines up.`);
