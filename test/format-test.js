"use strict";

const assert = require("assert").strict;

const minimist = require("minimist");

const Database = require("..").Database;


let options = minimist(process.argv.slice(2), {
  string: "terminal",
  alias: { term: "terminal", t: "terminal" },
  default: {
    terminal: process.env.TERM || "xterm"
  }
});

let database = new Database(options.terminal);

assert.equal(database.format("%%"), "%");

assert.equal(database.format("%p1%p2%p3%p4%p5%p6%p7%p8%p9%d%d%d%d%d%d%d%d%d", 1, 2, 3, 4, 5, 6, 7, 8, 9), "987654321");
assert.equal(database.format("%p1%d %p1%o %p1%x %p1%X %p2%s %p2%c", 30, "30"), "30 36 1e 1E 30 3");

assert.equal(database.format("%p1%+d %p2% d %p3%+ d %p4%#x", 14, 49, 18, 0x1b), "+14  49 +18 0x1b");
assert.equal(database.format("%p1%4d|%p1%.3d|%p1%4.3d|%p1%4.4d", 12), "  12|012| 012|0012");

assert.equal(database.format("%i%p1%d%p2%d%p3%d %i%p4%d%p5%d%p6%d", 1, 2, 3, "1", "2", "3"), "233 123");

assert.equal(database.format("%p1%Pa%p2%Pb %p3%PA%p4%PB", 10, "10", 20, "20"), " ");
assert.equal(database.format("%ga%d%gb%d %gA%d%gB%d"), "1010 2020");

assert.equal(database.format("%'a'%s %'asdf'%s"), "a asdf");
assert.equal(database.format("%{1}%d %{1234}%d"), "1 1234");

assert.equal(database.format("%p1%l%d %p2%l%d", "hello world!", 42), "12 2");

assert.equal(database.format("%p1%p2%+%d", 42, 56), "98");
assert.equal(database.format("%p1%p2%-%d", 42, 56), "-14");
assert.equal(database.format("%p1%p2%*%d", 42, 56), "2352");
assert.equal(database.format("%p1%p2%/%d %p3%p4%/%d %p5%p6%/%d", 42, 56, 126, 6, 14, 0), "0.75 21 0");
assert.equal(database.format("%p1%p2%m%d %p3%p4%m%d %p5%p6%m%d", 42, 56, 126, 6, 14, 0), "42 0 0");

assert.equal(database.format("%p1%p2%&%x", 0b0110, 0b1010), "2");
assert.equal(database.format("%p1%p2%|%x", 0b0110, 0b1010), "e");
assert.equal(database.format("%p1%p2%^%x", 0b0110, 0b1010), "c");
assert.equal(database.format("%p1%~%x", 0b0110), "-7");

assert.equal(database.format("%p1%p2%A%d %p3%p4%A%d %p5%p6%A%d %p7%p8%A%d", 0, 1, 1, 0, 1, 1, 0, 0), "0 0 1 0");
assert.equal(database.format("%p1%p2%O%d %p3%p4%O%d %p5%p6%O%d %p7%p8%O%d", 0, 1, 1, 0, 1, 1, 0, 0), "1 1 1 0");
assert.equal(database.format("%p1%!%d %p2%!%d %p3%!%d %p4%!%d", 0, 1, 1, 0), "1 0 0 1");

assert.equal(database.format("%p1%p2%=%d %p3%p4%=%d %p5%p6%=%d", 15, 10, 10, 15, 15, 15), "0 0 1");
assert.equal(database.format("%p1%p2%>%d %p3%p4%>%d %p5%p6%>%d", 15, 10, 10, 15, 15, 15), "1 0 0");
assert.equal(database.format("%p1%p2%<%d %p3%p4%<%d %p5%p6%<%d", 15, 10, 10, 15, 15, 15), "0 1 0");

assert.equal(database.format("%?%p1%t1%e0%; %?%p2%t1%e0%; %?%p3%t1%e0%; %?%p4%t1%e0%;", 1, "1", 0, "0"), "1 1 0 0");
assert.equal(database.format("%?%p1%t1%e%p2%t2%e0%; %?%p3%t3%e%p4%t4%e0%;", 0, 1, 0, 0), "2 0");

console.log("Tests passed");
process.exit(0);