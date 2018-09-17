const events = require("events");
const path = require("path");

const Database = require("./database.js");
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
    this.stdin = options.stdin;
    this.stdout = options.stdout;
    
    if ((!this.stdin.isTTY || !this.stdout.isTTY) && !options.forceTTY) {
      throw new Error("Stream isn't a tty stream");
    }

    this.database = new Database(options.termname, options.termpath); // throws a lot of stuff

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
     * alt + shift + 0-9: ^[) (0x1b + ))
     * ...other mics characters to catalog... (we shouldn't have to map these)
     * 65-90: A-Z (we shouldn't have to map these)
     * 97-122: a-z (we shouldn't have to map these)
     * ...other mics characters to catalog... (we shouldn't have to map these)
     * f1-f63: KEY_F(1-63)
     * ...other misc characters to catalog... (we shouldn't have to map these)
     */

    // Default to these characters if the terminal doesn't support alternate charsets
    this.alternateCharsetDefault = {
      "\u2518": "/", // bottom right
      "\u2510": "\\", // upper right
      "\u250c": "/", // upper left
      "\u2514": "\\", // bottom left
      "\u253c": "+", // 4 way
      "\u2500": "-", // horizontal line
      "\u251c": "+", // right facing t
      "\u2524": "+", // left facing t
      "\u2534": "+", // upwards facing t
      "\u252c": "+", // downwards facing t
      "\u2502": "|" // vertical line
    }    

    // Color constants by name and id
    // Thanks to https://jonasjacek.github.io/colors/
    this.colors = {
      // System colors
      // 8 bit colors
      "BLACK": 0,
      "RED": 1, // aka maroon
      "GREEN": 2,
      "YELLOW": 3, // aka olive
      "BLUE": 4, // aka navy
      "PURPLE": 5,
      "CYAN": 6, // aka teal
      "SILVER": 7,
      
      // 16 bit colors
      "GRAY": 8,
      "INTENSE_RED": 9,
      "INTENSE_GREEN": 10, // aka lime
      "INTENSE_YELLOW": 11,
      "INTENSE_BLUE": 12,
      "INTENSE_PURPLE": 13, // aka fuchsia
      "INTENSE_CYAN": 14, // aka aqua
      "WHITE": 15,

      // Since type coercion is a thing, this is probably the only good use for it
      // Lets us use this object as if it's an array, this.colors[i]
      0: [0, 0, 0], // black
      1: [128, 0, 0], // maroon
      2: [0, 128, 0], // green
      3: [128, 128, 0], // olive
      4: [0, 0, 128], // navy
      5: [128, 0, 128], // purple
      6: [0, 128, 128], // teal
      7: [192, 192, 192], // silver
      8: [128, 128, 128], // grey
      9: [255, 0, 0], // red
      10: [0, 255, 0], // lime
      11: [255, 255, 0], // yellow
      12: [0, 0, 255], // blue
      13: [255, 0, 255], // fuchsia
      14: [0, 255, 255], // aqua
      15: [255, 255, 255], // white
      16: [0, 0, 0], // grey0
      17: [0, 0, 95], // navyblue
      18: [0, 0, 135], // darkblue
      19: [0, 0, 175], // blue3
      20: [0, 0, 215], // blue3
      21: [0, 0, 255], // blue1
      22: [0, 95, 0], // darkgreen
      23: [0, 95, 95], // deepskyblue4
      24: [0, 95, 135], // deepskyblue4
      25: [0, 95, 175], // deepskyblue4
      26: [0, 95, 215], // dodgerblue3
      27: [0, 95, 255], // dodgerblue2
      28: [0, 135, 0], // green4
      29: [0, 135, 95], // springgreen4
      30: [0, 135, 135], // turquoise4
      31: [0, 135, 175], // deepskyblue3
      32: [0, 135, 215], // deepskyblue3
      33: [0, 135, 255], // dodgerblue1
      34: [0, 175, 0], // green3
      35: [0, 175, 95], // springgreen3
      36: [0, 175, 135], // darkcyan
      37: [0, 175, 175], // lightseagreen
      38: [0, 175, 215], // deepskyblue2
      39: [0, 175, 255], // deepskyblue1
      40: [0, 215, 0], // green3
      41: [0, 215, 95], // springgreen3
      42: [0, 215, 135], // springgreen2
      43: [0, 215, 175], // cyan3
      44: [0, 215, 215], // darkturquoise
      45: [0, 215, 255], // turquoise2
      46: [0, 255, 0], // green1
      47: [0, 255, 95], // springgreen2
      48: [0, 255, 135], // springgreen1
      49: [0, 255, 175], // mediumspringgreen
      50: [0, 255, 215], // cyan2
      51: [0, 255, 255], // cyan1
      52: [95, 0, 0], // darkred
      53: [95, 0, 95], // deeppink4
      54: [95, 0, 135], // purple4
      55: [95, 0, 175], // purple4
      56: [95, 0, 215], // purple3
      57: [95, 0, 255], // blueviolet
      58: [95, 95, 0], // orange4
      59: [95, 95, 95], // grey37
      60: [95, 95, 135], // mediumpurple4
      61: [95, 95, 175], // slateblue3
      62: [95, 95, 215], // slateblue3
      63: [95, 95, 255], // royalblue1
      64: [95, 135, 0], // chartreuse4
      65: [95, 135, 95], // darkseagreen4
      66: [95, 135, 135], // paleturquoise4
      67: [95, 135, 175], // steelblue
      68: [95, 135, 215], // steelblue3
      69: [95, 135, 255], // cornflowerblue
      70: [95, 175, 0], // chartreuse3
      71: [95, 175, 95], // darkseagreen4
      72: [95, 175, 135], // cadetblue
      73: [95, 175, 175], // cadetblue
      74: [95, 175, 215], // skyblue3
      75: [95, 175, 255], // steelblue1
      76: [95, 215, 0], // chartreuse3
      77: [95, 215, 95], // palegreen3
      78: [95, 215, 135], // seagreen3
      79: [95, 215, 175], // aquamarine3
      80: [95, 215, 215], // mediumturquoise
      81: [95, 215, 255], // steelblue1
      82: [95, 255, 0], // chartreuse2
      83: [95, 255, 95], // seagreen2
      84: [95, 255, 135], // seagreen1
      85: [95, 255, 175], // seagreen1
      86: [95, 255, 215], // aquamarine1
      87: [95, 255, 255], // darkslategray2
      88: [135, 0, 0], // darkred
      89: [135, 0, 95], // deeppink4
      90: [135, 0, 135], // darkmagenta
      91: [135, 0, 175], // darkmagenta
      92: [135, 0, 215], // darkviolet
      93: [135, 0, 255], // purple
      94: [135, 95, 0], // orange4
      95: [135, 95, 95], // lightpink4
      96: [135, 95, 135], // plum4
      97: [135, 95, 175], // mediumpurple3
      98: [135, 95, 215], // mediumpurple3
      99: [135, 95, 255], // slateblue1
      100: [135, 135, 0], // yellow4
      101: [135, 135, 95], // wheat4
      102: [135, 135, 135], // grey53
      103: [135, 135, 175], // lightslategrey
      104: [135, 135, 215], // mediumpurple
      105: [135, 135, 255], // lightslateblue
      106: [135, 175, 0], // yellow4
      107: [135, 175, 95], // darkolivegreen3
      108: [135, 175, 135], // darkseagreen
      109: [135, 175, 175], // lightskyblue3
      110: [135, 175, 215], // lightskyblue3
      111: [135, 175, 255], // skyblue2
      112: [135, 215, 0], // chartreuse2
      113: [135, 215, 95], // darkolivegreen3
      114: [135, 215, 135], // palegreen3
      115: [135, 215, 175], // darkseagreen3
      116: [135, 215, 215], // darkslategray3
      117: [135, 215, 255], // skyblue1
      118: [135, 255, 0], // chartreuse1
      119: [135, 255, 95], // lightgreen
      120: [135, 255, 135], // lightgreen
      121: [135, 255, 175], // palegreen1
      122: [135, 255, 215], // aquamarine1
      123: [135, 255, 255], // darkslategray1
      124: [175, 0, 0], // red3
      125: [175, 0, 95], // deeppink4
      126: [175, 0, 135], // mediumvioletred
      127: [175, 0, 175], // magenta3
      128: [175, 0, 215], // darkviolet
      129: [175, 0, 255], // purple
      130: [175, 95, 0], // darkorange3
      131: [175, 95, 95], // indianred
      132: [175, 95, 135], // hotpink3
      133: [175, 95, 175], // mediumorchid3
      134: [175, 95, 215], // mediumorchid
      135: [175, 95, 255], // mediumpurple2
      136: [175, 135, 0], // darkgoldenrod
      137: [175, 135, 95], // lightsalmon3
      138: [175, 135, 135], // rosybrown
      139: [175, 135, 175], // grey63
      140: [175, 135, 215], // mediumpurple2
      141: [175, 135, 255], // mediumpurple1
      142: [175, 175, 0], // gold3
      143: [175, 175, 95], // darkkhaki
      144: [175, 175, 135], // navajowhite3
      145: [175, 175, 175], // grey69
      146: [175, 175, 215], // lightsteelblue3
      147: [175, 175, 255], // lightsteelblue
      148: [175, 215, 0], // yellow3
      149: [175, 215, 95], // darkolivegreen3
      150: [175, 215, 135], // darkseagreen3
      151: [175, 215, 175], // darkseagreen2
      152: [175, 215, 215], // lightcyan3
      153: [175, 215, 255], // lightskyblue1
      154: [175, 255, 0], // greenyellow
      155: [175, 255, 95], // darkolivegreen2
      156: [175, 255, 135], // palegreen1
      157: [175, 255, 175], // darkseagreen2
      158: [175, 255, 215], // darkseagreen1
      159: [175, 255, 255], // paleturquoise1
      160: [215, 0, 0], // red3
      161: [215, 0, 95], // deeppink3
      162: [215, 0, 135], // deeppink3
      163: [215, 0, 175], // magenta3
      164: [215, 0, 215], // magenta3
      165: [215, 0, 255], // magenta2
      166: [215, 95, 0], // darkorange3
      167: [215, 95, 95], // indianred
      168: [215, 95, 135], // hotpink3
      169: [215, 95, 175], // hotpink2
      170: [215, 95, 215], // orchid
      171: [215, 95, 255], // mediumorchid1
      172: [215, 135, 0], // orange3
      173: [215, 135, 95], // lightsalmon3
      174: [215, 135, 135], // lightpink3
      175: [215, 135, 175], // pink3
      176: [215, 135, 215], // plum3
      177: [215, 135, 255], // violet
      178: [215, 175, 0], // gold3
      179: [215, 175, 95], // lightgoldenrod3
      180: [215, 175, 135], // tan
      181: [215, 175, 175], // mistyrose3
      182: [215, 175, 215], // thistle3
      183: [215, 175, 255], // plum2
      184: [215, 215, 0], // yellow3
      185: [215, 215, 95], // khaki3
      186: [215, 215, 135], // lightgoldenrod2
      187: [215, 215, 175], // lightyellow3
      188: [215, 215, 215], // grey84
      189: [215, 215, 255], // lightsteelblue1
      190: [215, 255, 0], // yellow2
      191: [215, 255, 95], // darkolivegreen1
      192: [215, 255, 135], // darkolivegreen1
      193: [215, 255, 175], // darkseagreen1
      194: [215, 255, 215], // honeydew2
      195: [215, 255, 255], // lightcyan1
      196: [255, 0, 0], // red1
      197: [255, 0, 95], // deeppink2
      198: [255, 0, 135], // deeppink1
      199: [255, 0, 175], // deeppink1
      200: [255, 0, 215], // magenta2
      201: [255, 0, 255], // magenta1
      202: [255, 95, 0], // orangered1
      203: [255, 95, 95], // indianred1
      204: [255, 95, 135], // indianred1
      205: [255, 95, 175], // hotpink
      206: [255, 95, 215], // hotpink
      207: [255, 95, 255], // mediumorchid1
      208: [255, 135, 0], // darkorange
      209: [255, 135, 95], // salmon1
      210: [255, 135, 135], // lightcoral
      211: [255, 135, 175], // palevioletred1
      212: [255, 135, 215], // orchid2
      213: [255, 135, 255], // orchid1
      214: [255, 175, 0], // orange1
      215: [255, 175, 95], // sandybrown
      216: [255, 175, 135], // lightsalmon1
      217: [255, 175, 175], // lightpink1
      218: [255, 175, 215], // pink1
      219: [255, 175, 255], // plum1
      220: [255, 215, 0], // gold1
      221: [255, 215, 95], // lightgoldenrod2
      222: [255, 215, 135], // lightgoldenrod2
      223: [255, 215, 175], // navajowhite1
      224: [255, 215, 215], // mistyrose1
      225: [255, 215, 255], // thistle1
      226: [255, 255, 0], // yellow1
      227: [255, 255, 95], // lightgoldenrod1
      228: [255, 255, 135], // khaki1
      229: [255, 255, 175], // wheat1
      230: [255, 255, 215], // cornsilk1
      231: [255, 255, 255], // grey100
      232: [8, 8, 8], // grey3
      233: [18, 18, 18], // grey7
      234: [28, 28, 28], // grey11
      235: [38, 38, 38], // grey15
      236: [48, 48, 48], // grey19
      237: [58, 58, 58], // grey23
      238: [68, 68, 68], // grey27
      239: [78, 78, 78], // grey30
      240: [88, 88, 88], // grey35
      241: [98, 98, 98], // grey39
      242: [108, 108, 108], // grey42
      243: [118, 118, 118], // grey46
      244: [128, 128, 128], // grey50
      245: [138, 138, 138], // grey54
      246: [148, 148, 148], // grey58
      247: [158, 158, 158], // grey62
      248: [168, 168, 168], // grey66
      249: [178, 178, 178], // grey70
      250: [188, 188, 188], // grey74
      251: [198, 198, 198], // grey78
      252: [208, 208, 208], // grey82
      253: [218, 218, 218], // grey85
      254: [228, 228, 228], // grey89
      255: [238, 238, 238], // grey93

      "length": 256 // Let's us use this.length and further pretend like it's an array
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
