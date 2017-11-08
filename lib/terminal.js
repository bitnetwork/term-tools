const events = require("events");
const path = require("path");
const terminfo = require("./terminfo.js");

class Terminal extends events.EventEmitter {
  constructor(options = {}) {
    super();
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    
    if (this.stdin.isTTY !== true || this.stdout.isTTY !== true) {
      throw new Error("Stream isn't a tty stream.");
    }
    
    this.terminfo = new terminfo(options.terminal || process.env.TERM, options.terminfo || path.join(__dirname, "vendor", "terminfo"));
    
    this.stdin.on("data", this._parseKey.bind(this));
  }

  _parseKey(data, keymapping) {
    if (typeof data === "string") {
      data = new Buffer(data);
    }
    
    if (keymapping === undefined) {
      keymapping = {};
    }
    
    for (let i = 0; i < data.length; i++) {
      console.log(`emitting: ${data[i]}`);
      this.emit("key", keymapping[data[i]]);
    }
  }
  
  write(data) {
    this.stdout.write(data);
  }

  moveAbsolute(x = 1, y = 1) {
    if (this.terminfo.capabilities.cursorAddress === "") {
      throw new Error("Terminal not capable");
    }
     
    this.stdin.write(this.terminfo.capabilities.cursorAddress(x, y));
  }
  
  moveRelative(x = 1, y = 1) {
    if (this.terminfo.capabilities.paramDownCursor === "" || this.terminfo.capabilities.paramUpCursor === "" || this.terminfo.capabilities.paramRightCursor === "" || this.terminfo.capabilities.paramLeftCursor === "") {
      throw new Error("Terminal not capable");
    }
    
    let output = "";
    if (y > 0) {
      output += this.terminfo.capabilities.paramDownCursor(Math.abs(y));
    } else if (y < 0) {
      output += this.terminfo.capabilities.paramUpCursor(Math.abs(y));
    }
    
    if (x > 0) {
      output += this.terminfo.capabilities.paramRightCursor(Math.abs(x));
    } else if (x < 0) {
      output += this.terminfo.capabilities.paramLeftCursor(Math.abs(x));
    }
    
    process.stdout.write(output);
  }
  
  clear() {
    if (this.terminfo.capabilities.clearScreen === "") {
      throw new Error("Terminal not capable");
    }
    
    this.stdout.write(this.terminfo.capabilities.clearScreen);
  }
  
  changeScreen(alternate = true) {
    if (this.terminfo.capabilities.enterCaMode === "" || this.terminfo.capabilities.exitCaMode === "") {
      throw new Error("Terminal not capable");
    }
    
    this.stdout.write(alternate ? this.terminfo.capabilities.enterCaMode : this.terminfo.capabilities.exitCaMode);
  }
  
  cursorVisible(visible = false) {
    if (this.terminfo.capabilities.cursorInvisible === "" || this.terminfo.capabilities.cursorVisible === "") {
      throw new Error("Terminal not capable");
    }
    
    this.stdout.write(visible ? this.terminfo.capabilities.cursorVisible : this.terminfo.capabilities.cursorInvisible);
  }
  
  statusLine(text) {
    if (this.terminfo.capabilities.toStatusLine === "" || this.terminfo.capabilities.fromStatusLine === "") {
      throw new Error("Terminal not capable");
    }
    
    this.stdout.write(this.terminfo.capabilities.toStatusLine + text + this.terminfo.capabilities.fromStatusLine);
  }
  
  reset() {
    for (let i = 1; i <= 3; i++) {
      if (this.terminfo.capabilities[`reset${i}String`] !== "") {
        this.stdout.write(this.terminfo.capabilities[`reset${i}String`]);
        return;
      }
    }
    
    throw new Error("Terminal not capable");
  }
}

module.exports = Terminal;
