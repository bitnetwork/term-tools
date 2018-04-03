const events = require("events");
const path = require("path");
const Terminfo = require("./Terminfo.js");
const NamedError = require("./NamedError.js");

class Terminal extends events.EventEmitter {
  constructor(options = {}) {
    super();
    this.stdin = options.stdin || process.stdin;
    this.stdout = options.stdout || process.stdout;
    
    if (this.stdin.isTTY !== true || this.stdout.isTTY !== true) {
      throw new NamedError("NotTTY", "Stream isn't a tty stream.");
    }
    
    this.terminfo = new Terminfo(options.terminal || process.env.TERM,
                                 options.terminfo || path.join(__dirname, "vendor", "terminfo"));

    /* 
     * Change this (and all future) comment styles to [this](https://www.reddit.com/r/ProgrammerHumor/comments/888pet/comments/dwixbd9/) later
     * Map all normal keys and modifiers
     *
     * backspace: KEY_BACKSPACE
     * tab: TAB
     * return: CARRIAGE_RETURN
     * shift: uppercase/ignore
     * ctrl: ^A (0x1)
     * alt: ^[a (0x1b + a)
     * alt-shift: ^[A (0x1b + A)
     * alt-ctrl: ^[^A (0x1b + 0x1)
     * ctrl-shift: ^A (same as ctrl) (0x1)
     * escape: 27 (avoid using) (0x1b)
     * space: 32 
     * page down: KEY_NPAGE
     * page up: KEY_PPAGE
     * end: KEY_END
     * home: KEY_HOME
     * up: KEY_UP
     * down: KEY_DOWN
     * left: KEY_LEFT
     * right: KEY_RIGHT
     * 97-122: a-z
     * 65-90: A-Z
     *
     */

    // Map all special keys, function keys, backspace, return, arrow keys, home, end, etc.
    // Filter out all keys except those that start with "KEY_"
    Object.keys(this.terminfo).filter(function(key) {
       return key.startsWith("KEY_");
    }).forEach(function(key) {
      this[key] = this.terminfo[key];
    }.bind(this));

    
    this.stdin.on("data", this._parseKey.bind(this));
  }
  
  
  // This method should be called for the first time so keys can be parsed
  open() {
    // We need to put the terminal emulator into "application mode" with KEYPAD_XMIT as the keys only match up in it
    this.write(this.terminfo.KEYPAD_XMIT);

    // Set the stream into raw mode so we can catch all keystrokes. Ctrl-c will no longer function and will have to be catched.
    this.stdin.setRawMode(true);
    
    // TO-DO: put more stuff here
  }
  
  
  // Call method when closing application so it can gracefully reset input
  close() {
    this.write(this.terminfo.KEYPAD_LOCAL);
    this.stdin.setRawMode(false);
  }

  
  _parseKey(data, keymapping) {
    if (typeof data === "string") {
      // Convert string data to a buffer if it isn't already
      data = new Buffer(data);
    }
    
  }
  
  
  write(data) {
    this.stdout.write(data);
  }
  
  
  move(x = 0, y = 0) {
    if (this.terminfo.CURSOR_ADDRESS === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
     
    return this.terminfo.format(this.terminfo.CURSOR_ADDRESS, x, y);
  }

  
  moveRelative(x = 1, y = 1) {
    if (this.terminfo.PARM_DOWN_CURSOR === "" || this.terminfo.PARM_UP_CURSOR === "" || this.terminfo.PARM_RIGHT_CURSOR === "" || this.terminfo.PARM_LEFT_CURSOR === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    let output = "";
    if (y > 0) {
      output += this.terminfo.format(this.terminfo.PARM_DOWN_CURSOR, Math.abs(y));
    } else if (y < 0) {
      output += this.terminfo.format(this.terminfo.PARM_UP_CURSOR, Math.abs(y));
    }
    
    if (x > 0) {
      output += this.terminfo.format(this.terminfo.PARM_RIGHT_CURSOR, Math.abs(x));
    } else if (x < 0) {
      output += this.terminfo.format(this.terminfo.PARM_LEFT_CURSOR, Math.abs(x));
    }
    
    return output;
  }
  
  clear() {
    if (this.terminfo.CLEAR_SCREEN === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.CLEAR_SCREEN;
  }
  
  changeScreen(alternate = true) {
    if (this.terminfo.ENTER_CA_MODE === "" || this.terminfo.EXIT_CA_MODE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return alternate ? this.terminfo.ENTER_CA_MODE : this.terminfo.EXIT_CA_MODE;
  }
  
  cursorVisible(visible = true) {
    if (this.terminfo.CURSOR_VISIBLE === "" || this.terminfo.CURSOR_INVISIBLE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return visible ? this.terminfo.CURSOR_VISIBLE : this.terminfo.CURSOR_INVISIBLE;
  }
  
  statusLine(text) {
    if (this.terminfo.TO_STATUS_LINE === "" || this.terminfo.FROM_STATUS_LINE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.TO_STATUS_LINE + text + this.terminfo.FROM_STATUS_LINE;
  }
  
  reset() {
    let output = "";
    
    for (let i = 1; i <= 3; i++) {
      if (this.terminfo[`RESET${i}_STRING`] !== "") {
        output += this.terminfo[`RESET${i}_STRING`];
      }
    }
    
    if (output === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    return output;
  }
}

module.exports = Terminal;