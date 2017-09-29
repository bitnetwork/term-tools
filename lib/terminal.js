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
  
  write(data) {
    this.stdout.write(data);
  }

  moveAbsolute(x = 1, y = 1) {
    if (this.terminfo.capabilities.cursorAddress === "") {
      throw new Error("Terminal not capable");
    }
  
    // this.stdin.write(this.terminfo.capabilities.cursorAddress.replace(/%i%p1%d/, x.toString(10)).replace(/%p2%d/, y.toString(10)));
    this.stdin.write(this.terminfo.capabilities.cursorAddress(x, y));
  }
  
  moveRelative(x = 1, y = 1) {
    if (this.terminfo.capabilities.paramDownCursor === "" || this.terminfo.capabilities.paramUpCursor === "" || this.terminfo.capabilities.paramRightCursor === "" || this.terminfo.capabilities.paramLeftCursor === "") {
      throw new Error("Terminal not capable");
    }
    
    
    let output = "";
    if (y > 0) {
      // output += this.terminfo.capabilities.parmDownCursor.replace(/\%p1\%d/, Math.abs(y).toString(10));
      output += this.terminfo.capabilities.paramDownCursor(Math.abs(y));
    } else if (y < 0) {
      // output += this.terminfo.capabilities.parmUpCursor.replace(/\%p1\%d/, Math.abs(y).toString(10))
      output += this.terminfo.capabilities.paramUpCursor(Math.abs(y));
    }
    
    if (x > 0) {
      // output += this.terminfo.capabilities.parmRightCursor.replace(/\%p1\%d/, Math.abs(y).toString(10));
      output += this.terminfo.capabilities.paramRightCursor(Math.abs(x));
    } else if (x < 0) {
      // output += this.terminfo.capabilities.parmLeftCursor.replace(/\%p1\%d/, Math.abs(y).toString(10))
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
}

module.exports = Terminal;
