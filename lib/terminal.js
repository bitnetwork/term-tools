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
    this.alternateCharsetFallback = {
      "\u2518": "+", // bottom right
      "\u2510": "+", // upper right
      "\u250c": "+", // upper left
      "\u2514": "+", // bottom left
      "\u253c": "+", // 4 way
      "\u2500": "-", // horizontal line
      "\u251c": "+", // right facing t
      "\u2524": "+", // left facing t
      "\u2534": "+", // upwards facing t
      "\u252c": "+", // downwards facing t
      "\u2502": "|" // vertical line
    }    

    // Color constants by name and id as a fucked up object/array
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

    this.keys = {};

    for (let i = 97; i < 123; i++) {
      let letter = String.fromCharCode(i);

      // ctrl-shift letter keys are not possible and will just display like ctrl
      this.keys["CTRL_" + letter.toUpperCase()] = String.fromCharCode(i - 96);
      this.keys["META_" + letter.toUpperCase()] = "\x1b" + letter;
      this.keys["META_SHIFT_" + letter.toUpperCase()] = "\x1b" + letter.toUpperCase();
      this.keys["META_CTRL_" + letter.toUpperCase()] = "\x1b" + String.fromCharCode(i - 96);
    }

    Object.keys(this.database).filter(function(key) {
      return key.startsWith("key") || /^beginPaste|endPaste|reportCursor|keyMouse$/.test(key);
    })
    .reduce(function(object, key) {
      let name = key;
      name = name.replace(/^key/, "").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
      if (/^beginPaste|endPaste|reportCursor|keyMouse$/.test(key)) {
        name = "_" + key;
      }
      
      object[name] = this.database[key];
      return object;
    }.bind(this), this.keys);

    // Additional hard-coded keys
    this.keys = Object.assign(this.keys, {
      ESCAPE: "\x1b"
    });

    // Ready for input, start recieving keystrokes
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

    let matches = this.keysFromBuffer(data);
    matches.forEach(function(key) {
      this.emit("key", key.key, key.raw);
    }.bind(this));
    
  }


  /*\
  \|/ Terminal.close
  /|\ Reset the terminal emulator back to state before .open was called. Call
  \|/ this when exiting the script to gracefully reset input. Ensure that
  /|\ process.on("exit"), SIGTERM and SIGINT are handled and bound to this. 
  /|\
  \|/ .close()
  /|\
  \*/
  close() {
    this.write(this.database.enterKeypad);
    // this.setAlternateBuffer(false);
    // this.resetAttribute();
    // this.resetColor();
    this.stdin.setRawMode(false);
  }

  clearScreen() {
    this.write(this.database.clear);
  }

  clearLine() {
    this.write(this.database.clearLine);
  }

  /*\
  \|/ Terminal.configureColor
  /|\ Configures the color of a slot to any rgb color which persists until resetColor is called.
  \|/
  /|\ .configureColor(id, color)
  \|/
  /|\ id <Number> Slot id to configure
  \|/ color <Array|String|Number> RGB color to set to or the default of another slot id
  /|\
  \*/
  configureColor(id, color) {   
    if (this.database.setColor === "" || id >= this.database.colors) {
      return;
    }

    if (typeof color === "string") {
      // Match either a 3 or 6 digit hex code with an optional pound sign
      let result = color.match(/^#?([\dabcdef]{1,2})([\dabcdef]{1,2})([\dabcdef]{1,2})$/);
      color = [];
      for (let i = 1; i < 4; i++) {
        color.push(parseInt(result[i].length < 2 ? result[i] + result[i] : result[i], 16));
      }
    } else if (typeof color === "number") {
      // Look it up in the color database we have and use that
      color = this.colors[color];
    }

    return this.database.format(this.database.setPair, id, ...color);
  }

  keysFromBuffer(data) {
    if (typeof data !== "string") {
      data = data.toString();
    }
  
    let output = [];

    while (data.length > 0) {
      // Length of longest string, and default to the length of first character (1)
      let length = 1;

      // Both filter and map at the same time by reducing into a new empty array
      let matches = Object.keys(this.keys).reduce(function(array, key) {
        let raw = this.keys[key];
        raw = typeof raw === "string" ? [raw] : raw;

        for (let i = 0; i < raw.length; i++) {
          // Preliminary length check to reduce later workload
          if (data.startsWith(raw[i]) && raw[i].length >= length) {
            array.push({key: key, raw: raw[i]});
            length = Math.max(length, raw[i].length);
          }
        }
      
        return array;
      }.bind(this), [])
      // Default to first character if no other result found
      .concat({key: data[0], raw: data[0]})
      .filter(function(key) {
        return key.raw.length === length;
      });

      output.push(...matches);
      // Protection from infinite loops, just in case, through we shouldn't need it
      data = data.substring(Math.max(length, 1));
    }

    return output;
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
  
  moveTo(x, y) {
    if (x == null) {
      this.write(this.database.format(this.database.moveColumn, y));
    } else if (y == null) {
      this.write(this.database.format(this.database.moveColumn, x));
    } else {
      this.write(this.database.format(this.database.moveCursor, x, y));
    }
  }

  /*\
  \|/ Terminal.open
  /|\ Setup the terminal emulator to recieve keystrokes so input can be parsed.
  \|/ Call this method before recieving input.
  /|\
  \|/ .open()
  /|\
  \*/
  open() {
    // We need to put the terminal emulator out of keypad mode to recieve proper inputs (however our database supports both)
    this.write(this.database.enterKeypad);

    // Set the stream into raw mode so we can catch all keystrokes. Signals will not be sent and there will be no way to exit the application.
    this.stdin.setRawMode(true);
    this.stdin.setEncoding("utf-8");
  }

  async requestCursor() {
    this.write(this.database.requestCursor);

    return await new Promise(function(resolve) {
      this.once("cursor", function(x, y) {
        resolve([x, y]);
      });
    });
  }

  reset() {
    this.write(this.database.reset);
  }

  resetAttribute() {
    this.write(this.database.resetAttribute);
  }

  resetColor() {
    this.write(this.database.resetColor);
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

  /*\
  \|/ Terminal.setAlternateBuffer
  /|\ Sets or unsets the alternate buffer, if supported.
  \|/
  /|\ .setAlternateBuffer(enable)
  \|/
  /|\ enable <Boolean> State to set to
  \*/
  setAlternateBuffer(enable) {
    this.write(enable ? this.database.enterAlternateBuffer : this.database.exitAlternateBuffer);
  }

  /*\
  \|/ Terminal.setBackgroundColor
  /|\ Sets the cell color to id. A list both generic and numeric colors can be
  \|/ found in this.colors
  /|\
  \|/ .setBackgroundColor(id)
  /|\
  \|/ id <Number> Color slot to set or negative to clear
  /|\
  \*/
  setBackgroundColor(id) {
    if (this.database.setBackground === "" && id >= this.database.colors) {
      return;
    }

    if (id < 0) {
      this.write(this.database.setBackgroundClear);
    } else {
      this.write(this.database.format(this.database.setBackground, id));
    }
  }

  setBracketedPaste(enable) {
    this.write(enable ? this.database.enterPaste : this.database.exitPaste);
  }

  setCursorStyle(style, steady) {
    if (this.database.setCursorStyle === "") {
      return;
    }
  
    this.write(this.format(this.setCursorStyle, style, steady));
  }

  setCursorVisibility(enable) {
    this.write(enable ? this.database.showCursor : this.database.hideCursor);
  }

  /*\
  \|/ Terminal.setForegroundColor
  /|\ Sets the text color to id. A list both generic and numeric colors can be
  \|/ found in this.colors
  /|\
  \|/ .setForegroundColor(id)
  /|\
  \|/ id <Number> Color slot to set or negative to clear
  /|\
  \*/
  setForegroundColor(id) {
    if (this.database.setForeground === "" && id >= this.database.colors) {
      return;
    }

    if (id < 0) {
      this.write(this.database.setForegroundClear);
    } else {
      this.write(this.database.format(this.database.setForeground, id));
    }
  }

  /*\
  \|/ Terminal.setMouseMode
  /|\ Enables or disables mouse mode, if supported.
  \|/
  /|\ .setMouseMode(state)
  \|/
  /|\ state <Boolean|Number> Sets mouse mode state or enables/disables
  \*/
  setMouseMode(state) {
    if (typeof state === "boolean") {
      state = state ? 2 : -1;
    }

    if (state < 0) {
      this.write(this.database.exitMouse);
    } else if (this.database.enterMouse !== "") {
      this.write(this.database.format(this.database.enterMouse, state));
    }
  }
  
  /*\
  \|/ Terminal.setStatus
  /|\ Sets the terminal status bar, if supported.
  \|/
  /|\ .setStatus(status)
  \|/
  /|\ status <String|Boolean> Write string to the status bar else set or unset
  \|/        status bar mode
  \*/
  setStatus(status) {
    if (this.database.enterStatus === "" || this.database.exitStatus === "") {
      return;
    }

    if (typeof status === "boolean") {
      this.write(status ? this.database.enterStatus : this.database.exitStatus);
    } else {    
      this.write(this.database.enterStatus + status + this.database.exitStatus);
    }
  }

  /*\
  \|/ Terminal.setStyle
  /|\ Change the state of current styles.
  \|/ 
  /|\ .setStyle(styles)
  \|/ 
  /|\ styles <Object> Object of states to modify
  \|/   bold <Boolean> Maximize noticebility
  /|\   dim <Boolean> Minimize noticebility
  \|/   reverse <Boolean> Swap the cell and text colors
  /|\   underline <Boolean> Draw a line underneath the text
  \|/   italic <Boolean> Slant the text
  /|\   conceal <Boolean> Make the text invisible
  \|/   blink <Boolean> Flash either the colors at a set interval
  /|\   strikethrough <Boolean> Draw a line through the middle of the text
  \*/
  setStyle(styles = {}) {
    let output = "";
    
    for (let key in styles) {
      let style = styles[key];
      if (style == null) {
        continue;
      }

      output += this.database[(style ? "enter" : "exit") + key[0].toUpperCase() + key.substring(1)];
    }

    this.write(output);
  }
  
  
  /*\
  \|/ Terminal.write
  /|\ Write data to the terminal emulator.
  \|/
  /|\ .write(data)
  \|/
  /|\ data <String|Buffer> Data to write
  \*/
  write(data) {
  
    if (!this.database.unicode && typeof data === "string") {
      // Unicode filter here
    }
  
    this.stdout.write(data);
  }
}

module.exports = Terminal;