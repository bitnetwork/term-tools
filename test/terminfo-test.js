const terminfo = require("../lib/terminfo.js");

console.log(new terminfo(process.argv[2], "../vendor/terminfo/"));
