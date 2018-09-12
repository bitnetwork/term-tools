const events = require("events");
const path = require("path");

const Terminfo = require("./terminfo.js");
const errors = require("./errors.js");


/*\
\|/ class Terminal
/|\ Create a interface to interact with the terminal emulator.
\|/
/|\ new Terminal([{[stdin][, stdout][, terminal][, terminfo]}])
\|/
/|\ 
/|\
\*/
class Terminal extends events.EventEmitter {
  constructor(options = {}) {

    options = Object.assign({
      stdin: process.stdin,
      stdout: process.stdout,
      forceTTY: false,
    }, options);
    
    super();
    this.stdin = stdin;
    this.stdout = stdout;
    
    if ((!this.stdin.isTTY || !this.stdout.isTTY) && !options.forceTTY) {
      throw new Error("Stream isn't a tty stream");
    }

    this.database = new Database(options.termfile, options.termpath); // throws a lot of stuff

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

    

    // Color constants
    // Thanks to https://jonasjacek.github.io/colors/ 
    // And to the color chart at http://www.calmar.ws/vim/256-xterm-24bit-rgb-color-chart.html
    this.colors = {
      // System colors
      // 8 bit colors
      "BLACK": 0,
      "RED": 1,
      "GREEN": 2,
      "YELLOW": 3,
      "BLUE": 4,
      "PURPLE": 5,
      "CYAN": 6,
      "WHITE": 7,
      
      // 16 bit colors
      "INTENSE_BLACK": 8,
      "INTENSE_RED": 9,
      "INTENSE_GREEN": 10,
      "INTENSE_YELLOW": 11,
      "INTENSE_BLUE": 12,
      "INTENSE_PURPLE": 13,
      "INTENSE_AQUA": 14,
      "INTENSE_WHITE": 15,
    };

    // Ready for input, start recieving keystrokes
    // this.stdin.on("data", this._parseKey.bind(this));
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
    this.write(this.database.exitKeypad);
    this.stdin.setRawMode(false);
  }

  clearScreen() {
    if (this.database.clear === "") {
      throw new Error("Not supported");
    }
    
    return this.database.clear;
  }
  
  configureColor(id, color) {
    // Might implement
    // Storage of color slots
    // MAX_COLORS max amount of colors slots
    
    if (this.terminfo.INITIALIZE_COLOR === "") {
      throw new Error("Not supported");
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

  hideCursor() {
    this.write(this.database.hideCursor);
  }
  
  moveBy(x = 0, y = 0) {
    let output = "";
    if (y > 0) {
      output += this.database.format(this.database.cursorDown, Math.abs(y));
    } else if (y < 0) {
      output += this.database.format(this.database.cursorUp, Math.abs(y));
    }
    
    if (x > 0) {
      output += this.database.format(this.database.cursorRight, Math.abs(x));
    } else if (x < 0) {
      output += this.database.format(this.database.cursorLeft, Math.abs(x));
    }
    
    this.write(output);
  }
  
  moveTo(x = 0, y = 0) {
    this.write(this.database.format(this.database.moveCursor, x, y));
  }

  enterAlternateScreen() {
    this.write(this.database.enterAlternateBuffer);
  }
  
  exitAlternateScreen() {
    this.write(this.database.exitAlternateBuffer);
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
    this.write(this.database.enterKeypad);

    // Set the stream into raw mode so we can catch all keystrokes. Ctrl-c will no longer function and will have to be catched.
    this.stdin.setRawMode(true);
  }

  reset() {
    this.write(this.database.reset);
  }

  restoreCursor() {
    this.write(this.database.restoreCursor);
  }

  saveCursor() {
    this.write(this.database.restoreCursor);
  }
  
  sendBell() {
    this.write(this.database.bell);
  }

  showCursor() {
    this.write(this.database.showCursor);
  }
  
  setStatus(text) {
    if (this.database.enterStatus === "" || this.database.exitStatus === "") {
      return;
    }
    
    this.write(this.database.enterStatus + text + this.database.exitStatus);
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
    for (let key in styles) {
      let style = styles[key];
      if (style == null) {
        continue;
      }

      output += this.database[style ? "enter" : "exit" + style[0].toUpperCase() + style.substring(1)];
    }

    this.write(output);
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
