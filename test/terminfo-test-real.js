const terminfo = require("../lib/Terminfo.js");

console.log(new terminfo(process.argv[2], process.argv[3] || "/usr/share/terminfo/"));
