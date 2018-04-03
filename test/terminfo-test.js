const terminfo = require("../lib/Terminfo.js");

console.log(new terminfo(process.argv[2], "../lib/vendor/terminfo/"));
