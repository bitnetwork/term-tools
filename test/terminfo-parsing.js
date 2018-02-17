const path = require("path");
const Terminfo = require(path.join(__dirname, "..")).Terminfo;

let terminfo = new Terminfo("xterm-new");

console.log(terminfo);

// CURSOR_ADDRESS "\u001b[%i%p1%d;%p2%dH"
if (terminfo.format(terminfo.capabilities.CURSOR_ADDRESS, 0, 0) === "\u001b[1;1H") {
  console.log("CURSOR_ADDRESS working");
}

// CHANGE_SCROLL_REGION "\u001b[%i%p1%d;%p2%dr"
//                                          10 v      20 v      30 v      40 v
process.stdout.write(terminfo.format(" begin%? statement %p1%t %p2%p3%/%d %efalse%; end ", parseInt(process.argv[2]), parseInt(process.argv[3])));

//process.stdout.write(termin);
