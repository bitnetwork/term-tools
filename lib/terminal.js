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

  moveAbsolute(x = 0, y = 0) {
    if (this.terminfo.capabilities.CURSOR_ADDRESS === "") {
      throw new Error("Terminal not capable");
    }
     
    return this.terminfo.format(this.terminfo.capabilities.CURSOR_ADDRESS, x, y);
  }
  
  moveRelative(x = 1, y = 1) {
    
    if (this.terminfo.capabilities.PARM_DOWN_CURSOR === "" || this.terminfo.capabilities.PARM_UP_CURSOR === "" || this.terminfo.capabilities.PARM_RIGHT_CURSOR === "" || this.terminfo.capabilities.PARM_LEFT_CURSOR === "") {
      throw new Error("Terminal not capable");
    }
    
    let output = "";
    if (y > 0) {
      output += this.terminfo.format(this.terminfo.capabilities.PARM_DOWN_CURSOR, Math.abs(y));
    } else if (y < 0) {
      output += this.terminfo.format(this.terminfo.capabilities.PARM_UP_CURSOR, Math.abs(y));
    }
    
    if (x > 0) {
      output += this.terminfo.format(this.terminfo.capabilities.PARM_RIGHT_CURSOR, Math.abs(x));
    } else if (x < 0) {
      output += this.terminfo.format(this.terminfo.capabilities.PARM_LEFT_CURSOR, Math.abs(x));
    }
    
    return output;
  }
  
  clear() {
    if (this.terminfo.capabilities.CLEAR_SCREEN === "") {
      throw new Error("Terminal not capable");
    }
    
    return this.terminfo.capabilities.CLEAR_SCREEN;
  }
  
  changeScreen(alternate = true) {
    if (this.terminfo.capabilities.ENTER_CA_MODE === "" || this.terminfo.capabilities.EXIT_CA_MODE === "") {
      throw new Error("Terminal not capable");
    }
    
    return alternate ? this.terminfo.capabilities.ENTER_CA_MODE : this.terminfo.capabilities.EXIT_CA_MODE;
  }
  
  cursorVisible(visible = true) {
    if (this.terminfo.capabilities.CURSOR_VISIBLE === "" || this.terminfo.capabilities.CURSOR_INVISIBLE === "") {
      throw new Error("Terminal not capable");
    }
    
    return visible ? this.terminfo.capabilities.CURSOR_VISIBLE : this.terminfo.capabilities.CURSOR_INVISIBLE;
  }
  
  statusLine(text) {
    if (this.terminfo.capabilities.TO_STATUS_LINE === "" || this.terminfo.capabilities.FROM_STATUS_LINE === "") {
      throw new Error("Terminal not capable");
    }
    
    return this.terminfo.capabilities.TO_STATUS_LINE + text + this.terminfo.capabilities.FROM_STATUS_LINE;
  }
  
  reset() {
    let output = "";
    
    for (let i = 1; i <= 3; i++) {
      if (this.terminfo.capabilities[`RESET${i}_STRING`] !== "") {
        output += this.terminfo.capabilities[`RESET${i}_STRING`];
      }
    }
    
    if (output === "") {
      throw new Error("Terminal not capable");
    }
    return output;
  }
}

module.exports = Terminal;
