const fs = require("fs");
const path = require("path");

class Terminfo {
  constructor(name = process.env.TERM, dir = path.join(__dirname, "vendor", "terminfo"), options = {}) {
    let buffer;

    try {
      buffer = fs.readFileSync(path.join(dir, name[0], name));
    } catch (error) {
      throw new Error("Terminal capibilites not found in database");
    }

    let offset = 0;
    let definitions = {
      boolean: [
        "AUTO_LEFT_MARGIN",
        "AUTO_RIGHT_MARGIN",
        "NO_ESC_CTRL_C",
        "CEOL_STANDOUT_GLITCH",
        "EAT_NEWLINE_GLITCH",
        "ERASE_OVERSTRIKE",
        "GENERIC_TYPE",
        "HARD_COPY",
        "HAS_META_KEY",
        "HAS_STATUS_LINE",
        "INSERT_NULL_GLITCH",
        "MEMORY_ABOVE",
        "MEMORY_BELOW",
        "MOVE_INSERT_MODE",
        "MOVE_STANDOUT_MODE",
        "OVER_STRIKE",
        "STATUS_LINE_ESC_OK",
        "DEST_TABS_MAGIC_SMSO",
        "TILDE_GLITCH",
        "TRANSPARENT_UNDERLINE",
        "XON_XOFF",
        "NEEDS_XON_XOFF",
        "PRTR_SILENT",
        "HARD_CURSOR",
        "NON_REV_RMCUP",
        "NO_PAD_CHAR"
      ],
      number: [
        "COLUMNS",
        "INIT_TABS",
        "LINES",
        "LINES_OF_MEMORY",
        "MAGIC_COOKIE_GLITCH",
        "PADDING_BAUD_RATE",
        "VIRTUAL_TERMINAL",
        "WIDTH_STATUS_LINE",
        "NUM_LABELS",
        "LABEL_HEIGHT",
        "LABEL_WIDTH",
        "MAX_ATTRIBUTES",
        "MAXIMUM_WINDOWS",
        "MAX_COLORS",
        "MAX_PAIRS",
        "NO_COLOR_VIDEO",
        "BUFFER_CAPACITY",
        "DOT_VERT_SPACING",
        "DOT_HORZ_SPACING",
        "MAX_MICRO_ADDRESS",
        "MAX_MICRO_JUMP",
        "MICRO_COL_SIZE",
        "MICRO_LINE_SIZE",
        "NUMBER_OF_PINS",
        "OUTPUT_RES_CHAR",
        "OUTPUT_RES_LINE",
        "OUTPUT_RES_HORZ_INCH",
        "OUTPUT_RES_VERT_INCH",
        "PRINT_RATE",
        "WIDE_CHAR_SIZE",
        "BUTTONS",
        "BIT_IMAGE_ENTWINING",
        "BIT_IMAGE_TYPE"
      ],
      string: [
        "BACK_TAB",
        "BELL",
        "CARRIAGE_RETURN",
        "CHANGE_SCROLL_REGION",
        "CLEAR_ALL_TABS",
        "CLEAR_SCREEN",
        "CLR_EOL",
        "CLR_EOS",
        "COLUMN_ADDRESS",
        "COMMAND_CHARACTER",
        "CURSOR_ADDRESS",
        "CURSOR_DOWN",
        "CURSOR_HOME",
        "CURSOR_INVISIBLE",
        "CURSOR_LEFT",
        "CURSOR_MEM_ADDRESS",
        "CURSOR_NORMAL",
        "CURSOR_RIGHT",
        "CURSOR_TO_LL",
        "CURSOR_UP",
        "CURSOR_VISIBLE",
        "DELETE_CHARACTER",
        "DELETE_LINE",
        "DIS_STATUS_LINE",
        "DOWN_HALF_LINE",
        "ENTER_ALT_CHARSET_MODE",
        "ENTER_BLINK_MODE",
        "ENTER_BOLD_MODE",
        "ENTER_CA_MODE",
        "ENTER_DELETE_MODE",
        "ENTER_DIM_MODE",
        "ENTER_INSERT_MODE",
        "ENTER_SECURE_MODE",
        "ENTER_PROTECTED_MODE",
        "ENTER_REVERSE_MODE",
        "ENTER_STANDOUT_MODE",
        "ENTER_UNDERLINE_MODE",
        "ERASE_CHARS",
        "EXIT_ALT_CHARSET_MODE",
        "EXIT_ATTRIBUTE_MODE",
        "EXIT_CA_MODE",
        "EXIT_DELETE_MODE",
        "EXIT_INSERT_MODE",
        "EXIT_STANDOUT_MODE",
        "EXIT_UNDERLINE_MODE",
        "FLASH_SCREEN",
        "FORM_FEED",
        "FROM_STATUS_LINE",
        "INIT1STRING",
        "INIT2STRING",
        "INIT3STRING",
        "INIT_FILE",
        "INSERT_CHARACTER",
        "INSERT_LINE",
        "INSERT_PADDING",
        "KEY_BACKSPACE",
        "KEY_CATAB",
        "KEY_CLEAR",
        "KEY_CTAB",
        "KEY_DC",
        "KEY_DL",
        "KEY_DOWN",
        "KEY_EIC",
        "KEY_EOL",
        "KEY_EOS",
        "KEY_F0",
        "KEY_F1",
        "KEY_F10",
        "KEY_F2",
        "KEY_F3",
        "KEY_F4",
        "KEY_F5",
        "KEY_F6",
        "KEY_F7",
        "KEY_F8",
        "KEY_F9",
        "KEY_HOME",
        "KEY_IC",
        "KEY_IL",
        "KEY_LEFT",
        "KEY_LL",
        "KEY_NPAGE",
        "KEY_PPAGE",
        "KEY_RIGHT",
        "KEY_SF",
        "KEY_SR",
        "KEY_STAB",
        "KEY_UP",
        "KEYPAD_LOCAL",
        "KEYPAD_XMIT",
        "LAB_F0",
        "LAB_F1",
        "LAB_F10",
        "LAB_F2",
        "LAB_F3",
        "LAB_F4",
        "LAB_F5",
        "LAB_F6",
        "LAB_F7",
        "LAB_F8",
        "LAB_F9",
        "META_OFF",
        "META_ON",
        "NEWLINE",
        "PAD_CHAR",
        "PARM_DCH",
        "PARM_DELETE_LINE",
        "PARM_DOWN_CURSOR",
        "PARM_ICH",
        "PARM_INDEX",
        "PARM_INSERT_LINE",
        "PARM_LEFT_CURSOR",
        "PARM_RIGHT_CURSOR",
        "PARM_RINDEX",
        "PARM_UP_CURSOR",
        "PKEY_KEY",
        "PKEY_LOCAL",
        "PKEY_XMIT",
        "PRINT_SCREEN",
        "PRTR_OFF",
        "PRTR_ON",
        "REPEAT_CHAR",
        "RESET1_STRING",
        "RESET2_STRING",
        "RESET3_STRING",
        "RESET_FILE",
        "RESTORE_CURSOR",
        "ROW_ADDRESS",
        "SAVE_CURSOR",
        "SCROLL_FORWARD",
        "SCROLL_REVERSE",
        "SET_ATTRIBUTES",
        "SET_TAB",
        "SET_WINDOW",
        "TAB",
        "TO_STATUS_LINE",
        "UNDERLINE_CHAR",
        "UP_HALF_LINE",
        "INIT_PROG",
        "KEY_A1",
        "KEY_A3",
        "KEY_B2",
        "KEY_C1",
        "KEY_C3",
        "PRTR_NON",
        "CHAR_PADDING",
        "ACS_CHARS",
        "PLAB_NORM",
        "KEY_BTAB",
        "ENTER_XON_MODE",
        "EXIT_XON_MODE",
        "ENTER_AM_MODE",
        "EXIT_AM_MODE",
        "XON_CHARACTER",
        "XOFF_CHARACTER",
        "ENA_ACS",
        "LABEL_ON",
        "LABEL_OFF",
        "KEY_BEG",
        "KEY_CANCEL",
        "KEY_CLOSE",
        "KEY_COMMAND",
        "KEY_COPY",
        "KEY_CREATE",
        "KEY_END",
        "KEY_ENTER",
        "KEY_EXIT",
        "KEY_FIND",
        "KEY_HELP",
        "KEY_MARK",
        "KEY_MESSAGE",
        "KEY_MOVE",
        "KEY_NEXT",
        "KEY_OPEN",
        "KEY_OPTIONS",
        "KEY_PREVIOUS",
        "KEY_PRINT",
        "KEY_REDO",
        "KEY_REFERENCE",
        "KEY_REFRESH",
        "KEY_REPLACE",
        "KEY_RESTART",
        "KEY_RESUME",
        "KEY_SAVE",
        "KEY_SUSPEND",
        "KEY_UNDO",
        "KEY_SBEG",
        "KEY_SCANCEL",
        "KEY_SCOMMAND",
        "KEY_SCOPY",
        "KEY_SCREATE",
        "KEY_SDC",
        "KEY_SDL",
        "KEY_SELECT",
        "KEY_SEND",
        "KEY_SEOL",
        "KEY_SEXIT",
        "KEY_SFIND",
        "KEY_SHELP",
        "KEY_SHOME",
        "KEY_SIC",
        "KEY_SLEFT",
        "KEY_SMESSAGE",
        "KEY_SMOVE",
        "KEY_SNEXT",
        "KEY_SOPTIONS",
        "KEY_SPREVIOUS",
        "KEY_SPRINT",
        "KEY_SREDO",
        "KEY_SREPLACE",
        "KEY_SRIGHT",
        "KEY_SRSUME",
        "KEY_SSAVE",
        "KEY_SSUSPEND",
        "KEY_SUNDO",
        "REQ_FOR_INPUT",
        "KEY_F11",
        "KEY_F12",
        "KEY_F13",
        "KEY_F14",
        "KEY_F15",
        "KEY_F16",
        "KEY_F17",
        "KEY_F18",
        "KEY_F19",
        "KEY_F20",
        "KEY_F21",
        "KEY_F22",
        "KEY_F23",
        "KEY_F24",
        "KEY_F25",
        "KEY_F26",
        "KEY_F27",
        "KEY_F28",
        "KEY_F29",
        "KEY_F30",
        "KEY_F31",
        "KEY_F32",
        "KEY_F33",
        "KEY_F34",
        "KEY_F35",
        "KEY_F36",
        "KEY_F37",
        "KEY_F38",
        "KEY_F39",
        "KEY_F40",
        "KEY_F41",
        "KEY_F42",
        "KEY_F43",
        "KEY_F44",
        "KEY_F45",
        "KEY_F46",
        "KEY_F47",
        "KEY_F48",
        "KEY_F49",
        "KEY_F50",
        "KEY_F51",
        "KEY_F52",
        "KEY_F53",
        "KEY_F54",
        "KEY_F55",
        "KEY_F56",
        "KEY_F57",
        "KEY_F58",
        "KEY_F59",
        "KEY_F60",
        "KEY_F61",
        "KEY_F62",
        "KEY_F63",
        "CLR_BOL",
        "CLEAR_MARGINS",
        "SET_LEFT_MARGIN",
        "SET_RIGHT_MARGIN",
        "LABEL_FORMAT",
        "SET_CLOCK",
        "DISPLAY_CLOCK",
        "REMOVE_CLOCK",
        "CREATE_WINDOW",
        "GOTO_WINDOW",
        "HANGUP",
        "DIAL_PHONE",
        "QUICK_DIAL",
        "TONE",
        "PULSE",
        "FLASH_HOOK",
        "FIXED_PAUSE",
        "WAIT_TONE",
        "USER0",
        "USER1",
        "USER2",
        "USER3",
        "USER4",
        "USER5",
        "USER6",
        "USER7",
        "USER8",
        "USER9",
        "ORIG_PAIR",
        "ORIG_COLORS",
        "INITIALIZE_COLOR",
        "INITIALIZE_PAIR",
        "SET_COLOR_PAIR",
        "SET_FOREGROUND",
        "SET_BACKGROUND",
        "CHANGE_CHAR_PITCH",
        "CHANGE_LINE_PITCH",
        "CHANGE_RES_HORZ",
        "CHANGE_RES_VERT",
        "DEFINE_CHAR",
        "ENTER_DOUBLEWIDE_MODE",
        "ENTER_DRAFT_QUALITY",
        "ENTER_ITALICS_MODE",
        "ENTER_LEFTWARD_MODE",
        "ENTER_MICRO_MODE",
        "ENTER_NEAR_LETTER_QUALITY",
        "ENTER_NORMAL_QUALITY",
        "ENTER_SHADOW_MODE",
        "ENTER_SUBSCRIPT_MODE",
        "ENTER_SUPERSCRIPT_MODE",
        "ENTER_UPWARD_MODE",
        "EXIT_DOUBLEWIDE_MODE",
        "EXIT_ITALICS_MODE",
        "EXIT_LEFTWARD_MODE",
        "EXIT_MICRO_MODE",
        "EXIT_SHADOW_MODE",
        "EXIT_SUBSCRIPT_MODE",
        "EXIT_SUPERSCRIPT_MODE",
        "EXIT_UPWARD_MODE",
        "MICRO_COLUMN_ADDRESS",
        "MICRO_DOWN",
        "MICRO_LEFT",
        "MICRO_RIGHT",
        "MICRO_ROW_ADDRESS",
        "MICRO_UP",
        "ORDER_OF_PINS",
        "PARM_DOWN_MICRO",
        "PARM_LEFT_MICRO",
        "PARM_RIGHT_MICRO",
        "PARM_UP_MICRO",
        "SELECT_CHAR_SET",
        "SET_BOTTOM_MARGIN",
        "SET_BOTTOM_MARGIN_PARM",
        "SET_LEFT_MARGIN_PARM",
        "SET_RIGHT_MARGIN_PARM",
        "SET_TOP_MARGIN",
        "SET_TOP_MARGIN_PARM",
        "START_BIT_IMAGE",
        "START_CHAR_SET_DEF",
        "STOP_BIT_IMAGE",
        "STOP_CHAR_SET_DEF",
        "SUBSCRIPT_CHARACTERS",
        "SUPERSCRIPT_CHARACTERS",
        "THESE_CAUSE_CR",
        "ZERO_MOTION",
        "CHAR_SET_NAMES",
        "KEY_MOUSE",
        "MOUSE_INFO",
        "REQ_MOUSE_POS",
        "GET_MOUSE",
        "SET_A_FOREGROUND",
        "SET_A_BACKGROUND",
        "PKEY_PLAB",
        "DEVICE_TYPE",
        "CODE_SET_INIT",
        "SET0_DES_SEQ",
        "SET1_DES_SEQ",
        "SET2_DES_SEQ",
        "SET3_DES_SEQ",
        "SET_LR_MARGIN",
        "SET_TB_MARGIN",
        "BIT_IMAGE_REPEAT",
        "BIT_IMAGE_NEWLINE",
        "BIT_IMAGE_CARRIAGE_RETURN",
        "COLOR_NAMES",
        "DEFINE_BIT_IMAGE_REGION",
        "END_BIT_IMAGE_REGION",
        "SET_COLOR_BAND",
        "SET_PAGE_LENGTH",
        "DISPLAY_PC_CHAR",
        "ENTER_PC_CHARSET_MODE",
        "EXIT_PC_CHARSET_MODE",
        "ENTER_SCANCODE_MODE",
        "EXIT_SCANCODE_MODE",
        "PC_TERM_OPTIONS",
        "SCANCODE_ESCAPE",
        "ALT_SCANCODE_ESC",
        "ENTER_HORIZONTAL_HL_MODE",
        "ENTER_LEFT_HL_MODE",
        "ENTER_LOW_HL_MODE",
        "ENTER_RIGHT_HL_MODE",
        "ENTER_TOP_HL_MODE",
        "ENTER_VERTICAL_HL_MODE",
        "SET_A_ATTRIBUTES",
        "SET_PGLEN_INCH"
      ]
    };


    if (buffer.readInt16LE(offset) !== 0x11a) {
      throw new Error("Invalid magic number");
    }

    let sizes = {
      name: buffer.readInt16LE(offset += 2),
      boolean: buffer.readInt16LE(offset += 2),
      number: buffer.readInt16LE(offset += 2),
      string: buffer.readInt16LE(offset += 2),
      table: buffer.readInt16LE(offset += 2)
    }
    this.sizes = sizes;

    let names = buffer.toString("ascii", offset += 2, offset + sizes.name - 1).split("|");
    this.terminal = names[0];
    this.description = names[names.length - 1];
    this.aliases = names.slice(0, names.length - 1);
    offset += sizes.name;

    this.capabilities = {};

    for (let i = 0; i < Math.min(sizes.boolean, definitions.boolean.length); i++) {
      this.capabilities[definitions.boolean[i]] = Boolean(buffer.readInt8(offset + i));
    }
    offset += sizes.boolean;
    offset += offset % 2;

    for (let i = 0; i < Math.min(sizes.number, definitions.number.length); i++) {
      let number = buffer.readInt16LE(offset + (i * 2));
      this.capabilities[definitions.number[i]] = number;
    }
    offset += sizes.number * 2;
    offset += offset % 2;

    for (let i = 0; i < Math.min(sizes.string, definitions.string.length); i++) {
      let stringOffset = buffer.readInt16LE(offset + (i * 2));

      if (stringOffset !== -1) {
        let stringLength = 0;
        while (buffer[offset + (sizes.string * 2) + stringOffset + stringLength] !== 0) {
          stringLength++;
        }

        let string = buffer.toString("ascii", offset + (sizes.string * 2) + stringOffset, offset + (sizes.string * 2) + stringOffset + stringLength);
        this.capabilities[definitions.string[i]] = string;
      } else {
        this.capabilities[definitions.string[i]] = "";
      }
    }
    
    // Used in format method for variables with names from a to z, lowercase is dynamic, uppercase is static
    this.variables = {};
  }

  format(string, ...params) {
    /*/
     * Litteral god
     * http://invisible-island.net/ncurses/man/terminfo.5.html#h3-Parameterized-Strings
     * https://www.tutorialspoint.com/c_standard_library/c_function_printf.htm
     *
     * TO-DO:
     * - Make flags, width & precision work
     *   Although many terminal codes don't use this feature, get it done anyways.
     * - Rest of encodings listed in invisible island
     *   If then else is needed for CGR, get done!
    /*/

    const regex = /%:?([-+ #0])?(\d+|\*)?((?:\.\d+)|(?:\.\*))?([%doxXcsl+\-*/m&|^AO!~i?te;]|(?:p[1-9])|(?:'[^]')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))/;

    let stack = [];

    let offset = 0;

    while (string.substring(offset).search(regex) !== -1) {
      // [matched string, flags -+ #0, width 0-9*, .precision, specifier + parameters]
      let match = string.substring(offset).match(regex);
      let search = string.substring(offset).search(regex);
      let output = "";

      switch(match[4].substring(0, 1)) {
        // %% - escape precent sign
        case "%":
          output = "%";
          break;
        // %[[:]flags][width[.precision]]d - pop and print integer as decimal
        case "d":
          output = stack.pop().toString(10);
          break;
        // %[[:]flags][width[.precision]]o - pop and print integer as octal
        case "o":
          output = stack.pop().toString(8);
          break;
        // %[[:]flags][width[.precision]]x - pop and print integer as hexadecimal
        case "x":
          output = stack.pop().toString(16);
          break;
        // %[[:]flags][width[.precision]]X - pop and print integer as uppercase hexadecimal
        case "X":
          output = stack.pop().toString(16).toUpperCase();
          break;
        // %[[:]flags][width[.precision]]s - pop and print string
        case "s":
          output = stack.pop();
          break;
        // %c - pop and print char
        case "c":
          output = stack.pop()[0];
          break;
        // %p[1-9] - push paramater x
        case "p":
          stack.push(params[parseInt(match[4].substring(1, 2), 10) - 1]);
          break;
        // %P[a-z] - set dynamic variable x to pop
        // %P[A-Z] - set static variable x to pop
        case "P":
          this.variables[match[4].substring(1, 2)] = stack.pop();
          break;
        // %g[a-z] - push dynamic variable x
        // %g[A-Z] - push static variable x
        case "g":
          stack.push(this.variables[match[4].substring(1, 2)]);
          break;
        // %'c' - char constant c (do we push it on the stack?)
        case "\'":
          stack.push(match[4].substring(1, 2));
          break;
        // %{nn} - integer constant nn (do we push this also?)
        case "{":
          stack.push(parseInt(match[4].substring(1, 2), 10));
          break;
        // %l - push length of pop
        case "l":
          stack.push((stack.pop() || "").length);
          break;
        // push(pop() operation pop())
        // %+ - push sum of pop and pop
        case "+":
          stack.push((stack.pop || 0) + (stack.pop || 0));
          break;
        // %- - push pop minus pop
        case "-":
          stack.push((stack.pop || 0) - (stack.pop || 0));
          break;
        // %* - push product of pop and pop
        case "*":
          stack.push((stack.pop || 0) * (stack.pop || 0));
          break;
        // %/ - push quotient of pop over pop
        case "/":
          let result = (stack.pop || 0) / (stack.pop || 0);
          stack.push(result === Infinity || isNaN(result) ? 0 : result); // Divide by zero and other stuffes
          break;
        // %m - push modulus of pop over pop
        case "m":
          result = (stack.pop || 0) / (stack.pop || 0); // Fuck scopes in switch statements
          stack.push(result === Infinity || isNaN(result) ? 0 : result);
          break;
        // %& - push bitwise operation of pop and pop
        case "&":
          stack.push((stack.pop || 0) & (stack.pop || 0));
          break;
        // %| - push bitwise operation of pop or pop
        case "|":
          stack.push((stack.pop || 0) | (stack.pop || 0));
          break;
        // %^ - push bitwise operation of pop xor pop
        case "^":
          stack.push((stack.pop || 0) ^ (stack.pop || 0));
          break;
        // %= - push logical operation of pop equals pop
        case "=":
          stack.push((stack.pop || 0) === (stack.pop || 0));
          break;
        // %> - push logical operation of pop greater than pop
        case ">":
          stack.push((stack.pop || 0) > (stack.pop || 0));
          break;
        // %< - push logical operation of pop lesser than pop
        case "<":
          stack.push((stack.pop || 0) < (stack.pop || 0));
          break;
        // %A - push logical operation of pop and pop (do we push this on the stack?)
        case "A":
          stack.push((stack.pop || 0) && (stack.pop || 0));
          break;
        // %O - push logical operation of pop or pop (push this also?)
        case "O":
          stack.push((stack.pop || 0) || (stack.pop || 0));
          break;
        // %! - push unary logical operation of not pop
        case "!":
          stack.push(!(stack.pop || 0));
          break;
        // %~ - push unary bitwise operation of not pop
        case "~":
          stack.push(~(stack.pop || 0));
          break;
        // %i - increment the first two paramaters
        case "i":
          params[0]++;
          params[1]++;
          break;
        // %? - being condition of if statement
        case "?":
          break;
        // %t - then condition of if statement
        case "t":
          if (stack.pop() !== 1) { // false
            let end = string.search(/%(?:e|;)/);
            if (end === -1) {
              break;
            }
            
            string = string.substring(0, offset) + string.substring(end);
            
            console.log(offset);
            offset -= search;
            console.log(offset);
            
          } else { // true
            let end = string.search(/%;/);
            let other = string.search(/%e/);
            console.log(`else ${other}, end ${end}`);
            
            if (other !== -1 && other < end) { // check if we are actually using the else part of the statement
              string = string.substring(0, other) + string.substring(end);
              offset -= search;
              
            }
          }
          break;
        // %e - else condition of if statement
        case "e":
          break;
        // %; - end condition of if statement
        case ";":
          break;
      }
      
      // console.log(`${stack}\n${offset}|${output}\n`);

      // string = string.substring(0, offset) + string.substring(offset).replace(regex, output);
      offset += search + output.length;
      string = string.substring(0, offset - output.length) + output + string.substring(offset - output.length + match[0].length);
    }
    return string;
  }
  
}

module.exports = Terminfo;
