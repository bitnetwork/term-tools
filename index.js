let events = require("events");
let ansi = require("./ansi");

class Terminal extends events.EventEmitter {
  constructor(options = {}) {
    super();
    this.ingoreTTY = options.ingoreTTY || false;
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    if (this.stdin.isTTY !== true || this.stdout.isTTY !== true) {
      throw new Error("Stream isn't a tty stream.");
    }
    this.stdin.setRawMode(true);
    
    
  }

  _dataHandler(data) {
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      console.log(byte);
    }
  }
  
  _parseKey(data, keymapping) {
    if (typeof data === "string") {
      data = new Buffer(data);
    }
    
    if (keymapping === undefined) {
      keymapping = {};
      for (let i = 97; i <= 122; i++) {
        keymapping[i] = String.fromCharCode(i);
      }
    }
    
    let output = [];
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      output.push(keymapping[byte] || null);
    }
    return output;
  }

  moveAbs(x = 1, y = 1) {
    this.stdin.write(ansi.cup(x, y));
  }
  
  moveRel(x = 1, y = 1) {
    this.stdin.write((x > 1 ? ansi.cud(x) : "") + (x < 1 ? ansi.cuu(x) : "") + (y > 1 ? ansi.cuf(y) : "") + (y < 1 ? ansi.cub(y) : ""));
  }
  
  write(data) {
    this.stdout.write(data);
  }
  
  clear() {
    this.stdout.write(ansi.ed());
  }
}

module.exports = Terminal;
