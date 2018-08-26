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
assert.equal(database.format("%p1%d%p2%d %p1%o%p2%o %p1%x%p2%x %p1%X%p2%X %p1%s%p2%s %p1%c%p2%c", 30, "30"), "3030 3636 1e1e 1E1E 3030 33");
// Do checks for flags/width/precision/negative numbers

assert.equal(database.format("%i%p1%d%p2%d%p3%d %i%p4%d%p5%d%p6%d", 1, 2, 3, "1", "2", "3"), "233 123");

assert.equal(database.format("%p1%Pa%p2%Pb %p3%PA%p4%PB", 10, "10", 20, "20"), " ");
assert.equal(database.format("%ga%d%gb%d %gA%d%gB%d"), "1010 2020");

assert.equal(database.format("%'a'%s %'asdf'%s"), "a asdf");
assert.equal(database.format("%{1}%d %{1234}%d"), "1 1234");

assert.equal(database.format("%p1%l%d %p2%l%d", "hello world!", 42), "12 2");

assert.equal(database.format("%p2%p1%+%d", 42, 56), "98");
assert.equal(database.format("%p2%p1%-%d", 42, 56), "-14");
assert.equal(database.format("%p2%p1%*%d", 42, 56), "2352");
assert.equal(database.format("%p2%p1%/%d %p4%p3%/%d %p6%p5%/%d", 42, 56, 126, 6, 14, 0), "0", "21", "0");
assert.equal(database.format("%p2%p1%/%m %p4%p3%/%m %p6%p5%/%m", 42, 56, 126, 6, 14, 0), "42", "0", "0");

assert.equal(database.format("%p2%p1%&%x", 0b0110, 0b1010), "2");
assert.equal(database.format("%p2%p1%&|x", 0b0110, 0b1010), "e");
assert.equal(database.format("%p2%p1%&^x", 0b0110, 0b1010), "c");
assert.equal(database.format("%p1%~x", 0b0110), "9");

assert.equal(database.format("%p2%p1%A%d %p4%p3%A%d %p6%p5%A%d %p8%p7%A%d", 0, 1, 1, 0, 1, 1, 0, 0), "0010");
assert.equal(database.format("%p2%p1%O%d %p4%p3%O%d %p6%p5%O%d %p8%p7%O%d", 0, 1, 1, 0, 1, 1, 0, 0), "1110");
assert.equal(database.format("%p1%!%d %p2%!%d %p3%!%d %p4%!%d", 0, 1, 1, 0), "1001");

assert.equal(database.format("%p2%p1%=%d %p4%p3%=%d %p6%p5%=%d", 15, 10, 10, 15, 15, 15), "001");
assert.equal(database.format("%p2%p1%>%d %p4%p3%>%d %p6%p5%>%d", 15, 10, 10, 15, 15, 15), "100");
assert.equal(database.format("%p2%p1%<%d %p4%p3%<%d %p6%p5%<%d", 15, 10, 10, 15, 15, 15), "010");

assert.equal(database.format("%?%p1%t1%e0%; %?%p2%t1%e0%; %?%p3%t1%e0%; %?%p4%t1%e0%;", 1, "1", 0, "0"), "1 1 0 0");

console.log("Tests passed");
process.exit(0);