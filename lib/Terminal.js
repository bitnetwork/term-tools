const events = require("events");
const path = require("path");
const Terminfo = require("./Terminfo.js");


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
      if (typeof this.terminfo[name ? name : key] === undefined) {
        return false;
      }
      
      this[key] = this.terminfo[name ? name : key];
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
      if (!setKey("KEY_F" + i.toString(10))) {
        break;
      }
    }
    
    this.stdin.on("data", this._parseKey.bind(this));
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
    
    // TO-DO: put more stuff here
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

    // WORKAROUND: Make all 0x7f into 0x8 for backspace.

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

      // Search through the whole keymap for a match starting at index i
      for (let j = 0; j < sortedKeys.length; j++) {
        let key = sortedKeys[j];
        let length = this[key].length;

        // console.log(key);
        // console.log(length);
        
        if (unsorted.substring(0, length) === this[key] && length > 0) {
          // qqqqq()
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