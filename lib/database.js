"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const { NotFoundError } = require("./errors.js");


/*\
\|/ class Database
/|\ Retrieve and parse a database json file
\|/
/|\ new Database([termfile], [termpath])
\|/
/|\ <String|Buffer> termfile          Either a file name or file buffer to parse.
\|/ <String|Array[String]> termpath   A (list of) search director[y|ies] used as a path.
/|\
\|/ throws NotFoundError  On termfile not found
/|\ throws SyntaxError    On invalid file contents
\|/ throws Error          SystemError on reading file; excludes ENOENT
/|\
\*/

class Database {
  constructor(termfile, termpath = [
    path.join(os.homedir(), ".term-db"), path.join(__dirname, "..", "database")
  ]) {

    // Ensure that termpath is an array
    if (!(termpath instanceof Array)) {
      termpath = [termpath.toString()];
    }

    // List of all possible capabilities and their bare (dumb terminal like) defaults
    this._defaultCapabilities = {
      "description": "",

      "columns": 80,
      "lines": 24,
      "colors": 0,
      "truecolor": false,
    
      "bell": "",
      "clear": "",
      "clearLine": "",
      "reset": "",
      "enterAlternateBuffer": "",
      "exitAlternateBuffer": "",
      "enterKeypad": "",
      "exitKeypad": "",
      "enterStatus": "",
      "exitStatus": "",
      "enterAlternateCharset": "",
      "exitAlternateCharset": "",
      "enterPaste": "",
      "exitPaste": "",
      "beginPaste": "",
      "endPaste": "",

      "showCursor": "",
      "hideCursor": "",
      "changeScrollRegion": "",
    
      "moveCursor": "",
      "moveColumn": "",
      "moveRow": "",
      "cursorDown": "",
      "cursorUp": "",
      "cursorRight": "",
      "cursorLeft": "",
      "saveCursor": "",
      "restoreCursor": "",
      "requestCursor": "",
      "reportCursor": "",
    
      "enterBold": "",
      "exitBold": "",
      "enterDim": "",
      "exitDim": "",
      "enterReverse": "",
      "exitReverse": "",
      "enterUnderline": "",
      "exitUnderline": "",
      "enterItalic": "",
      "exitItalic": "",
      "enterConceal": "",
      "exitConceal": "",
      "enterBlink": "",
      "exitBlink": "",
      "enterStrikethrough": "",
      "exitStrikethrough": "",
      "resetAttribute": "",

      "setForeground": "",
      "setBackground": "",
      "setForegroundClear": "",
      "setBackgroundClear": "",
      "setForegroundTrue": "",
      "setBackgroundTrue": "",
      "setPair": "",
      "resetColor": "",
    
      "enterMouse": "",
      "exitMouse": "",
      "keyMouse": ""
    };

    let json = "";
    if (typeof termfile === "string") {
    
      let found = false;
      for (let i = 0; i < termpath.length; i++) {
      
        try {
          // throws Error
          json = fs.readFileSync(path.join(termpath[i], termfile) + ".json");
          found = true;
          break;
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
        
      }

      if (!found) {
        throw new NotFoundError(`Terminal ${termfile} not found in path ${termpath}.`);
      }
    
    } else if (termfile instanceof Buffer) {
      json = termfile.toString();
    }

    // throws SyntaxError
    // Ensure that all missing capabilities are filled with a default value
    Object.assign(this, this._defaultCapabilities, JSON.parse(json));
    
    // Expose in case the user wants to loop through later
    this.capabilities = Object.keys(this._defaultCapabilities);

    // Storing both dynamic and static variables
    this.variables = {};
  }

  /*\
  \|/ method deformat
  /|\ Reverse format a terminfo parameterized string to determine expected argumentd
  \|/
  /|\ .deformat(program, output)
  \|/
  /|\ <String> program  Program string to format
  \|/ <String> output   Output string to reverse format with program string
  /|\
  \|/ return <Array[String|Number]> args  Expected arguments
  /|\
  \*/
  deformat(program, output) {
    // Main issue with all implementations is that strings need to be parsed
    // and terminfo presents these as a paramatized string.
    // We could either a: hardcode methods to only work for xterm,
    // b: code begin and end strings, or c: do what we are
    // This method may not be fast or reliable at all but it sure is flexible.
    // You should always be handling errors thrown from this.

    // This will match a paramatized string token
    // String.match returns [matched string, flags, width, precision, flagSpecifier, specifier]
    const regex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z]))))/;
    // '
    // For use with String.split
    const splitRegex = /(%(?:(?::?[-+ #]{0,4}(?:d+)?(?:\.\d+)?[doxXs])|(?:[%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))))/; 
    // '

    const printableRegex = /some regex/g;

    let tokens = program.split(splitRegex).filter(function(value) {
      // Filter out empty tokens
      return value !== "";
    });

    let outputTokens = tokens.map(function(value) {
      
      let regexResult = value.match(printableRegex);
    
      if (regexResult === null) {
        return "";
      }

      let flags = regexResult[1];
      let width = parseInt(regexResult[2], 10);
      let precision = parseInt(regexResult[3], 10);
      let operator = regexResult[4] ? regexResult[4] : regexResult[5];

      switch (operator[0]) {
        case "%":
          return "%";

        // ... black magic ...
      }
    });

    let args = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    let stack = [];
    for (let i = tokens.length; i > 0; i--) {
      // ... black magic ...
    }

    return args;
  }

  /*\
  \|/ method format
  /|\ Format a terminfo parameterized string
  \|/
  /|\ .format(program, ...args)
  \|/
  /|\ <String> program                  Program string to format
  \|/ <String|Number|Boolean> ...args   Arguments to pass to program string
  /|\
  \|/ return <String> output  Formatted result
  /|\
  \*/
  format(program, ...args) {

    // This will match a paramatized string token
    // String.match returns [matched string, flags, width, precision, flagSpecifier, specifier]
    const regex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z]))))/;
    // '
    // For use with String.split
    const splitRegex = /(%(?:(?::?[-+ #]{0,4}(?:d+)?(?:\.\d+)?[doxXs])|(?:[%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))))/;
    // '
    const conditionalRegex = /%([?te;])/;
        
    args = args.map(function(value) {
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      return value;
    });

    // Ensure there are at least 9 arguments
    for (let i = args.length; i < 9; i++) {
      args.push(0);
    }

    let tokens = program.split(splitRegex).filter(function(value) {
      // Filter out empty tokens
      return value !== "";
    });

    let stack = [];
    let executeStack = []; // Responsible for handling if statements
    let output = "";

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      let regexResult = token.match(regex);

      if (executeStack.some(function(value) {
        return value !== 0;
      }) && !conditionalRegex.test(token)) {
        continue;
      }

      // If the token is not a operator, print it
      if (regexResult === null) {
        output += token;
        continue;
      }

      let flags = regexResult[1];
      let width = parseInt(regexResult[2], 10);
      let precision = parseInt(regexResult[3], 10);
      let operator = regexResult[4] ? regexResult[4] : regexResult[5];

      let result = "";
      let pop1, pop2, execute;

      // NB Some operators may crash with a TypeError as the stack can contain both strings and numbers
      //    Also note that stack.pop will return undefined if the stack is empty

      switch (operator[0]) {
      
        // %% - escape precent sign
        case "%":
          result = "%";
          break;
          
        // %[[:]flags][width][.precision]d - pop and print integer as decimal
        case "d":
          // Math.round already does type conversion for us
          result = Math.round(stack.pop() || 0).toString(10);
          break;
          
        // %[[:]flags][width][.precision]o - pop and print integer as octal
        case "o":
          result = Math.round(stack.pop() || 0).toString(8);
          break;
          
        // %[[:]flags][width][.precision]x - pop and print integer as hexadecimal
        case "x":
          result = Math.round(stack.pop() || 0).toString(16);
          break;
          
        // %[[:]flags][width][.precision]X - pop and print integer as uppercase hexadecimal
        case "X":
          result = Math.round(stack.pop() || 0).toString(16).toUpperCase();
          break;
          
        // %[[:]flags][width][.precision]s - pop and print string
        case "s":
          result = stack.pop().toString() || "";
          break;
          
        // %c - pop and print char
        case "c":
          result = (stack.pop() || "").toString()[0]; // Incase the stack contains a string
          break;
          
        // %p[1-9] - push paramater x
        case "p":
          stack.push(args[parseInt(operator[1], 10) - 1]);
          break;

        // %i - increment the first two paramaters
        case "i":
          args[0]++;
          args[1]++;
          break;
          
        // %P[a-z] - set dynamic variable x to pop
        // %P[A-Z] - set static variable x to pop
        case "P":
          this.variables[operator[1]] = stack.pop();
          break;
          
        // %g[a-z] - push dynamic variable x
        // %g[A-Z] - push static variable x
        case "g":
          stack.push(this.variables[operator[1]]);
          break;
          
        // %'c' - push char constant c
        case "\'":
          stack.push(operator.substring(1, operator.length - 1));
          break;
          
        // %{nn} - push integer constant nn
        case "{":
          stack.push(parseInt(operator.substring(1, operator.length - 1), 10));
          break;
          
        // %l - push length of pop
        case "l":
          stack.push(stack.pop().toString().length);
          break;
          
        // pop1 = pop()
        // pop2 = pop()
        // push(pop2() operator pop1())
        
        // %+ - push sum of pop and pop
        case "+":
          stack.push((stack.pop() || 0) + (stack.pop() || 0));
          break;
          
        // %- - push pop2 minus pop1
        case "-":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          stack.push(pop2 - pop1);
          break;
          
        // %* - push product of pop and pop
        case "*":
          stack.push((stack.pop() || 0) * (stack.pop() || 0));
          break;
          
        // %/ - push quotient of pop2 over pop1
        case "/":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          // Dividing by zero returns 0
          // Peserving floating point numbers by not flooring
          stack.push(pop1 === 0 ? 0 : pop2 / pop1);
          break;
          
        // %m - push modulus of pop2 over pop1
        case "m":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          // Dividing by zero returns 0
          stack.push(pop1 === 0 ? 0 : pop2 % pop1);
          break;
          
        // %& - push bitwise operation of pop and pop
        case "&":
          stack.push((stack.pop() || 0) & (stack.pop() || 0));
          break;
          
        // %| - push bitwise operation of pop or pop
        case "|":
          stack.push((stack.pop() || 0) | (stack.pop() || 0));
          break;
          
        // %^ - push bitwise operation of pop xor pop
        case "^":
          stack.push((stack.pop() || 0) ^ (stack.pop() || 0));
          break;

        // %~ - push unary bitwise operation of not pop
        case "~":
          stack.push(~(stack.pop() || 0));
          break;

        // %A - push logical operation of pop and pop
        case "A":
          stack.push((stack.pop() || 0) && (stack.pop() || 0));
          break;
          
        // %O - push logical operation of pop or pop
        case "O":
          stack.push((stack.pop() || 0) || (stack.pop() || 0));
          break;
          
        // %! - push unary logical operation of not pop
        case "!":
          stack.push(!(stack.pop() || 0));
          break;
          
        // %= - push logical operation of pop2 equals pop1
        case "=":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          stack.push((pop2 === pop1) ? 1 : 0);
          break;
          
        // %> - push logical operation of pop2 greater than pop1
        case ">":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          stack.push((pop2 > pop1) ? 1 : 0);
          break;
          
        // %< - push logical operation of pop2 lesser than pop1
        case "<":
          pop1 = stack.pop() || 0;
          pop2 = stack.pop() || 0;
          stack.push((pop2 < pop1) ? 1 : 0);
          break;
        
        // %? - being condition of if statement
        case "?":

          // 0: has not executed, not blocking
          // 1: has not executed, is blocking
          // -1: has executed, is blocking
          // If we ever encounter non-blocking on a else token, set it to -1
          // A value of -1 indicates the value must never be changed again
          executeStack.push(0);
          break;
          
        // %t - then condition of if statement
        case "t":
          execute = executeStack.pop();
          
          if (execute === undefined) {
            break;
          } else if (execute < 0) {
            // It has already executed so preserve it
            executeStack.push(-1);
            break;
          }

          // If pop is 0, block execution, else unblock it
          executeStack.push(stack.pop() === "0" ? 1 : 0);
          break;
          
        // %e - else condition of if statement
        case "e":
          execute = executeStack.pop();
                    
          if (execute === undefined) {
            break;
          }
          // If it just finished executing, mark it
          // If it is blocking, start unblocking (flip state)
          executeStack.push(execute < 1 ? -1 : 0)
          break;
          
        // %; - end condition of if statement
        case ";":
          executeStack.pop();
          break;
          
      }

      // Do some post flag, width & precision processing processing with result
      if (flags !== undefined) {
        // %+[doxX] - force sign to display (even for positive values)
        if (flags.search(/\+/) > -1 && result.search(/-/) === -1) {
          result = "+" + result;
        }

        // % [doxX] - if no sign is to be written, a space is written instead
        if (flags.search(" ") > -1 && result.search(/-|\+/) === -1) {
          result = " " + result;
        }

        // %#[oxX] - prepend a 0, 0x & 0X for o, x & X, respectively
        if (flags.search("#") > -1) {
          result = {
            d: "",
            s: "",
            o: "0",
            x: "0x",
            X: "0X"
          }[operator] + result;
        }
      }

      // %.n[doxX] - expand to match at least n digits with leading zeros
      if (precision !== undefined && precision > result.replace(/[^1234567890abcdef]/gi, "").length) {
        result = "0".repeat(precision - result.replace(/[^1234567890abcdef]/gi, "").length);
      }

      // %n[doxXs] - expand to match at least n characters with leading spaces
      if (width !== undefined && width > result.length) {
        let padding = " ".repeat(width - result.length);
        
        // %-[doxXs] - left justify for width
        result = flags.search("-") > -1 ? result + padding : padding + result;
      }

      output += result;
      
    }

    return output;
    
  }

  /*\
  \|/ method forEach
  /|\ Retrieve and parse a database json file
  \|/
  /|\ .forEach(callback)
  \|/
  /|\ <Function> callback   Called on every capability
  \|/   <String> key          Capability name
  /|\   <String> value        Capability value
  \*/
  forEach(callback) {
    this.capabilities.forEach(function(key) {
      let value = this[key];
      callback(key, value);
    }.bind(this));
  }

  /*\
  \|/ method toString
  /|\ Stringify capabilities into JSON
  \|/
  /|\ .toString(indent)
  \|/
  /|\ <String|Number> indent  Indent output by this value/amount of spaces
  \*/
  toString(indent = "  ") {
    let jsonCapabilities = {};

    // This is easy and also ensures that the order keys are pushed is the same as this.capabilities
    this.forEach(function(key, value) {
      jsonCapabilities[key] = value;
    });

    return JSON.stringify(jsonCapabilities, null, indent);
  }
}

module.exports = Database;