const events = require("events");
const path = require("path");
const Terminfo = require("./terminfo.js");


/*\
\|/ Clearly the best way to comment.
/|\ https://www.reddit.com/r/ProgrammerHumor/comments/888pet/comments/dwixbd9/
\*/


/*\
\|/ TO-DO
/|\
\|/ - Events and event handling
/|\ - Color methods
\|/ - Docs for all the methods (using this comment style)
/|\
\*/


/*\
\|/ NamedError
/|\ Create a throwable error with a name to distinguish it from other errors.
\|/
/|\ new NamedError([name[, message[, fileName[, lineNumber]]]])
\|/
/|\ <String> [name="Error"] Name of error. Can be used to distinguish from other
\|/ errors when catching.
/|\ <String> [message] Human readable error message.
\|/ <String> [fileName] Filename of code causing error.
/|\ <Number> [lineNumber] Line number of resulting error.
\*/
class NamedError extends Error {
  constructor(name = "Error", ...args) {
    super(...args);
    this.name = name;
    // Error.captureStackTrace(this, NamedError);
  }
}


/*\
\|/ class Terminal
/|\ Create a interface to interact with the terminal emulator.
\|/
/|\ new Terminal([{[stdin][, stdout][, terminal][, terminfo]}])
\|/
/|\ [stdin=process.stdin]       <Stream> Incoming stream to attach to.
\|/ [stdout=process.stdout]     <Stream> Outgoing stream to attach to.
/|\ [terminal=process.env.TERM] <String> Terminal name of terminal emulator
\|/ attached to the streams. Defaults to the environment variable TERM.
/|\ [terminfo]                  <String> Directory containing the terminfo
\|/ database. Defaults to the build in pre-compiled database in vendor.
/|\
\*/
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
     * Map all normal keys and modifiers
     * Ideas: Only map wierd keys that can vary from terminal to terminal.
     * No point mapping normal letter keys or 1-length symbols (;:'",.<>|\[]!@(),
     etc) and let the user just do a string comparison in the event handler.
     * MAYBE TODO SOMEDAY:
     * - Alt (+ Shift) + 0-9 keys (\x1b + 1) (\x1b + !)
     * - Alt (+ Shift) + Misc keys (,./;'\[]-=`) (\x1b + ,) (\x1b + <)
     * - Ctrl | Alt + Arrow keys (terminfo doesn't support this, so this likely won't happen)
     *
     * backspace: KEY_BACKSPACE
     * tab: TAB
     * shift-tab: BACK_TAB
     * return: CARRIAGE_RETURN (on most terminals, return and ctrl-m are interchangable, it is advised that you check for both keys in the event)
     * shift: none
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
     * up: KEY_UP (application mode only)
     * down: KEY_DOWN (application mode only)
     * left: KEY_LEFT (application mode only)
     * right: KEY_RIGHT (application mode only)
     * insert: KEY_IC
     * delete: KEY_DC
     * 0-9: 48-57 (we shouldn't have to map these)
     * alt + 0-9: ^[0 (0x1b + 0)
     * alt + shit + 0-9: ^[) (0x1b + ))
     * ...other mics characters to catalog... (we shouldn't have to map these)
     * 65-90: A-Z (we shouldn't have to map these)
     * 97-122: a-z (we shouldn't have to map these)
     * ...other mics characters to catalog... (we shouldn't have to map these)
     * f1-f63: KEY_F(1-63)
     * ...other misc characters to catalog... (we shouldn't have to map these)
     */

    let escape = "\x1b";

    // Map a key from it's terminfo name (otherwise copy over with same name)
    let setKey = function(key, name) {
      let value = this.terminfo[name ? name : key];
      
      if (typeof value === "undefined") {
        return false;
      }
      
      this[key] = value;
      return true;
    }.bind(this);
    
    // Loop through uppercase bounds
    for (let i = 65; i <= 90; i++) {
      this["KEY_CTRL_" + String.fromCharCode(i)] = String.fromCharCode(i - 64); // \x01
      this["KEY_ALT_" + String.fromCharCode(i)] = escape + String.fromCharCode(i).toLowerCase(); // \x1ba
      this["KEY_ALT_SHIFT_" + String.fromCharCode(i)] = escape + String.fromCharCode(i); // \x1bA
      this["KEY_ALT_CTRL_" + String.fromCharCode(i)] = escape + String.fromCharCode(i - 64); // \x1b\x01
      // KEY_CTRL_SHIFT is the same as KEY_CTRL (shift does nothing)
    }

    setKey("KEY_BACKSPACE"); // Will usually be 0x8, but some systems might report key 0x7f
    setKey("KEY_TAB", "TAB");
    setKey("KEY_SHIFT_TAB", "BACK_TAB")
    setKey("KEY_RETURN", "CARRIAGE_RETURN");
    this.KEY_ESCAPE = escape;
    setKey("KEY_PGDOWN", "KEY_NPAGE");
    setKey("KEY_PGUP", "KEY_PPAGE");
    setKey("KEY_END");
    setKey("KEY_HOME");
    setKey("KEY_UP");
    setKey("KEY_DOWN");
    setKey("KEY_LEFT");
    setKey("KEY_RIGHT");
    setKey("KEY_INSERT", "KEY_IC");
    setKey("KEY_DELETE", "KEY_DC"); // Will usually be E[4\0x126, but some systems might report key 0x7f

    for (let i = 1; i <= 63; i++) {
      this["KEY_F" + i.toString(10)] = "";
    }

    // Color constants
    // Thanks to https://jonasjacek.github.io/colors/ 
    // And to the color chart at http://www.calmar.ws/vim/256-xterm-24bit-rgb-color-chart.html
    let colors = [
      // System colors
      // 8 bit colors
      "BLACK",
      "RED",
      "GREEN",
      "YELLOW",
      "BLUE",
      "PURPLE",
      "CYAN",
      "WHITE",
      
      // 16 bit colors
      "INTENSE_BLACK",
      "INTENSE_RED",
      "INTENSE_GREEN",
      "INTENSE_YELLOW",
      "INTENSE_BLUE",
      "INTENSE_PURPLE",
      "INTENSE_AQUA",
      "INTENSE_WHITE",
    ];
    
    for (let i = 0; i < colors.length; i++) {
      let color = colors[i];
      this["COLOR_" + color] = i;
    }

    // Ready for input, start recieving keystrokes (tbh we should attach the listener on this.open)
    this.stdin.on("data", this._parseKey.bind(this));
  }
  

  /*\
  \|/ Terminal._parseKey
  /|\ Internally process some input data and parse them as keys. Calls the key
  \|/ event for each key press parsed in data.
  /|\
  \|/ ._parseKey(data)
  /|\ private
  \|/
  /|\ data <Buffer|String> Input data to parse.
  \|/
  /|\ event key
  \|/   Called for each key press parsed.
  /|\
  \|/   .on("key", function(value[, mapping]) {...})
  /|\
  \|/   value <String> String value of key detected.
  /|\   mapping <String> String value of key constant mapping parsed.
  \*/
  _parseKey(data) {
    if (typeof data !== "string") {
      // Convert string data to a buffer if it isn't already
      data = data.toString();
    }

    let sortedKeys = Object.keys(this).filter(function(key) {
      return key.startsWith("KEY_");
    })
    // Sort gives 2 keys at once, taking in an index of where the first key should be in relation to the second
    .sort(function(first, second) {
      return this[second].length - this[first].length; // Sort by length in descending order.
    }.bind(this));

    for (let i = 0; i < data.length; i++) {
      let unsorted = data.substring(i);
      let matched = false;
      
      // Workaround for 0x7f to match backspace as some systems do that
      if (unsorted.charCodeAt(0) === 0x7f && this.KEY_BACKSPACE !== "\x7f") {
        this.emit("key", this.KEY_BACKSPACE, "KEY_BACKSPACE");
      }

      // Search through the whole keymap for a match starting at index i
      for (let j = 0; j < sortedKeys.length; j++) {
        let key = sortedKeys[j];
        let length = this[key].length;
        
        if (unsorted.substring(0, length) === this[key] && length > 0) {
          this.emit("key", unsorted.substring(0, length), key);
          i += length - 1; // Artificially increment the counter as we already matched this segement. Substract one for the default loop incrementer.
          matched = true;
          break;
        }
      }

      // If a match is not found, just emit one character at a time.
      if (!matched) {
        this.emit("key", unsorted.substring(0, 1), null);
      }
      
    }
    
  }


  /*\
  \|/ Terminal.close
  /|\ Reset the terminal emulator back to state before .open was called. Call
  \|/ this when exiting the script to gracefully reset input.
  /|\
  \|/ .close()
  /|\
  \*/
  close() {
    this.write(this.terminfo.KEYPAD_LOCAL);
    this.stdin.setRawMode(false);
  }


  clearScreen() {
    if (this.terminfo.CLEAR_SCREEN === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.CLEAR_SCREEN;
  }

  
  configureColor(id, color) {
    // Might implement
    // Storage of color slots
    // MAX_COLORS max amount of colors slots
    
    if (this.terminfo.INITIALIZE_COLOR === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    let r, g, b = 0;
    if (typeof color === "string") {
      let colors = ((color[0] === "#") ? color.substring(1) : color);
      r = parseInt(colors.substring(0, 2), 16);
      g = parseInt(colors.substring(2, 4), 16);
      b = parseInt(colors.substring(4, 6), 16);
    } else {
      r = color[0];
      g = color[1];
      b = color[2];
    }

    return this.terminfo.format(this.terminfo.INITIALIZE_COLOR, id, r / 256 * 1000, g / 256 * 1000, b / 256 * 1000);
  }

  
  moveBy(x = 1, y = 1) {
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
      
  
  moveTo(x = 0, y = 0) {
    if (this.terminfo.CURSOR_ADDRESS === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
     
    return this.terminfo.format(this.terminfo.CURSOR_ADDRESS, x, y);
  }
  

  enterAlternateScreen() {
    if (this.terminfo.ENTER_CA_MODE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    return this.terminfo.ENTER_CA_MODE;
  }

  
  exitAlternateScreen() {
    if (this.terminfo.EXIT_CA_MODE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.EXIT_CA_MODE;
  }


  /*\
  \|/ Terminal.open
  /|\ Setup the terminal emulator to recieve keystrokes so input can be parsed.
  \|/ Call this method once before sending any data to the terminal.
  /|\
  \|/ .open()
  /|\
  \*/
  open() {
    // We need to put the terminal emulator into "application mode" with KEYPAD_XMIT as the keys only match up in it
    this.write(this.terminfo.KEYPAD_XMIT);

    // Set the stream into raw mode so we can catch all keystrokes. Ctrl-c will no longer function and will have to be catched.
    this.stdin.setRawMode(true);

    // Maybe use the init strings (INIT1)
    // TO-DO: put more stuff here
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


  restoreCursor() {
    if (this.terminfo.RESTORE_CURSOR === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    return this.terminfo.RESTORE_CURSOR;
  }


  saveCursor() {
    if (this.terminfo.SAVE_CURSOR === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    return this.terminfo.SAVE_CURSOR;
  }

  
  sendBell() {
    if (this.terminfo.BELL === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    return this.terminfo.BELL;
  }


  setCursorVisible() {
    if (this.terminfo.CURSOR_VISIBLE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    return this.terminfo.CURSOR_VISIBLE;
  }

  
  setCursorInvisible() {
    if (this.terminfo.CURSOR_INVISIBLE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.CURSOR_INVISIBLE;
  }
  
  setStatusLine(text) {
    if (this.terminfo.TO_STATUS_LINE === "" || this.terminfo.FROM_STATUS_LINE === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }
    
    return this.terminfo.TO_STATUS_LINE + text + this.terminfo.FROM_STATUS_LINE;
  }


  setBackgroundColor(id) {
    if (this.terminfo.SET_BACKGROUND === "" && this.terminfo.SET_A_BACKGROUND === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    if (this.terminfo.MAX_COLORS <= id && this.terminfo.MAX_COLORS !== -1) {
      throw new NamedError("OutOfRange", "Color index out of range");
    }
    
    return this.terminfo.format(this.terminfo.SET_BACKGROUND !== "" ? this.terminfo.SET_BACKGROUND : this.terminfo.SET_A_BACKGROUND, id);
  }


  setForegroundColor(id) {
    if (this.terminfo.SET_FOREGROUND === "" && this.terminfo.SET_A_FOREGROUND === "") {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    if (this.terminfo.MAX_COLORS <= id && this.terminfo.MAX_COLORS !== -1) {
      throw new NamedError("OutOfRange", "Color index out of range");
    }
    
    return this.terminfo.format(this.terminfo.SET_FOREGROUND !== "" ? this.terminfo.SET_FOREGROUND : this.terminfo.SET_A_FOREGROUND, id);
  }


  setStyle(styles = {}) {
    // Might implement
    // NO_COLOR_VIDEO defines styles that can't be used with color
    // MAX_ATTRIBUTES defines max amount of attributes
    
    let use = styles.standout || styles.underline || styles.reverse ||
      styles.blink || styles.dim || styles.bold || styles.invisible ||
      styles.protect || styles.altcharset;
    let use1 = styles.horizontal || styles.left || styles.low || styles.right ||
      styles.top || styles.vertical;
    
    if (this.terminfo.SET_ATTRIBUTES === "" && use) {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    if (this.terminfo.SET_A_ATTRIBUTES === "" && use1) {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    if ((this.terminfo.ENTER_ITALICS_MODE === "" || this.terminfo.EXIT_ITALICS_MODE === "") && styles.italic) {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    if (this.terminfo.EXIT_ATTRIBUTES === "" && !use && !use1 && !styles.italic) {
      throw new NamedError("NotCapable", "Terminal not capable");
    }

    let output = "";

    output += use ? this.terminfo.format(this.terminfo.SET_ATTRIBUTES,
      styles.standout ? 1 : 0, styles.underline ? 1 : 0, styles.reverse ? 1 : 0,
      styles.blink ? 1 : 0, styles.dim ? 1 : 0, styles.bold ? 1 : 0,
      styles.invisible ? 1 : 0, styles.protect ? 1 : 0, styles.altcharset ? 1 : 0) : "";

    output += use1 ? this.terminfo.format(this.terminfo.SET_A_ATTRIBUTES,
      styles.horizontal ? 1 : 0, styles.left ? 1 : 0, styles.low ? 1 : 0,
      styles.right ? 1 : 0, styles.top ? 1 : 0, styles.vertical) : "";
    
    output += styles.italic ? this.terminfo.ENTER_ITALICS_MODE : this.terminfo.EXIT_ITALICS_MODE;

    output += !use && !use1 && !styles.italic ? this.terminfo.EXIT_ATTRIBUTE_MODE : "";

    return output;
  }
  
  
  /*\
  \|/ Terminal.write
  /|\ Write data to the terminal emulator.
  \|/
  /|\ .write(data)
  \|/
  /|\ data <String|Buffer> Data to write.
  \*/
  write(data) {
    this.stdout.write(data);
  }
}

module.exports = Terminal;
