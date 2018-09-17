"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const { NotFoundError, InconsistentError } = require("./errors.js");


/*\
\|/ class Database
/|\ Retrieve and parse a database json file
\|/
/|\ new Database([termname], [termpath])
\|/
/|\ <String|Buffer> termname          Either a file name or file buffer to parse.
\|/ <String|Array[String]> termpath   A (list of) search director[y|ies] used as a path.
/|\
\|/ throws NotFoundError  On termname not found
/|\ throws SyntaxError    On invalid file contents
\|/ throws Error          SystemError on reading file; excludes ENOENT
/|\
\*/

class Database {
  constructor(termname = process.env.TERM, termpath = [
    path.join(os.homedir(), ".term-db"),
    path.join(__dirname, "..", "database")
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
      "unicode": false,
    
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
    
      "moveCursor": "",
      "moveColumn": "",
      "moveRow": "",
      "cursorUp": "",
      "cursorDown": "",
      "cursorRight": "",
      "cursorLeft": "",
      "saveCursor": "",
      "restoreCursor": "",
      "requestCursor": "",
      "reportCursor": "",

      "showCursor": "",
      "hideCursor": "",
      "setCursorStyle": "",
      "alternateCharset": {},
      "changeScrollRegion": "",
    
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
      "keyMouse": "",

      "keyUp": "",
      "keyDown": "",
      "keyRight": "",
      "keyLeft": "",
      "keyReturn": "",
      "keyBackspace": "",
      "keyDelete": "",
      "keyTab": "",
      "keyInsert": "",
      "keyHome": "",
      "keyEnd": "",
      "keyPageLast": "",
      "keyPageNext": "",
    
      "keyShiftUp": "",
      "keyShiftDown": "",
      "keyShiftRight": "",
      "keyShiftLeft": "",
      "keyShiftReturn": "",
      "keyShiftTab": "",
    
      "keyCtrlUp": "",
      "keyCtrlDown": "",
      "keyCtrlRight": "",
      "keyCtrlLeft": "",
      "keyCtrlBackspace": "",
      "keyCtrlDelete": "",
      "keyCtrlInsert": "",
      "keyCtrlHome": "",
      "keyCtrlEnd": "",
      "keyCtrlPageLast": "",
      "keyCtrlPageNext": "",
    
      "keyMetaUp": "",
      "keyMetaDown": "",
      "keyMetaRight": "",
      "keyMetaLeft": "",
      "keyMetaBackspace": "",
      "keyMetaDelete": "",
      "keyMetaInsert": "",
      "keyMetaHome": "",
      "keyMetaEnd": "",
      "keyMetaPageLast": "",
      "keyMetaPageNext": "",
    
      "keyMetaShiftUp": "",
      "keyMetaShiftDown": "",
      "keyMetaShiftRight": "",
      "keyMetaShiftLeft": "",
    
      "keyMetaCtrlUp": "",
      "keyMetaCtrlDown": "",
      "keyMetaCtrlRight": "",
      "keyMetaCtrlLeft": "",
      "keyMetaCtrlBackspace": "",
      "keyMetaCtrlDelete": "",
      "keyMetaCtrlInsert": "",
      "keyMetaCtrlHome": "",
      "keyMetaCtrlEnd": "",
      "keyMetaCtrlPageLast": "",
      "keyMetaCtrlPageNext": "",
    
      "keyMetaCtrlShiftUp": "",
      "keyMetaCtrlShiftDown": "",
      "keyMetaCtrlShiftRight": "",
      "keyMetaCtrlShiftLeft": "",
      
      "keyF1": "",
      "keyF2": "",
      "keyF3": "",
      "keyF4": "",
      "keyF5": "",
      "keyF6": "",
      "keyF7": "",
      "keyF8": "",
      "keyF9": "",
      "keyF10": "",
      "keyF11": "",
      "keyF12": "",
    
      "keyShiftF1": "",
      "keyShiftF2": "",
      "keyShiftF3": "",
      "keyShiftF4": "",
      "keyShiftF5": "",
      "keyShiftF6": "",
      "keyShiftF7": "",
      "keyShiftF8": "",
      "keyShiftF9": "",
      "keyShiftF10": "",
      "keyShiftF11": "",
      "keyShiftF12": "",
    
      "keyCtrlF1": "",
      "keyCtrlF2": "",
      "keyCtrlF3": "",
      "keyCtrlF4": "",
      "keyCtrlF5": "",
      "keyCtrlF6": "",
      "keyCtrlF7": "",
      "keyCtrlF8": "",
      "keyCtrlF9": "",
      "keyCtrlF10": "",
      "keyCtrlF11": "",
      "keyCtrlF12": "",
    
      "keyMetaF1": "",
      "keyMetaF2": "",
      "keyMetaF3": "",
      "keyMetaF4": "",
      "keyMetaF5": "",
      "keyMetaF6": "",
      "keyMetaF7": "",
      "keyMetaF8": "",
      "keyMetaF9": "",
      "keyMetaF10": "",
      "keyMetaF11": "",
      "keyMetaF12": ""
    };

    let json = "";
    if (typeof termname === "string") {
    
      let found = false;
      for (let i = 0; i < termpath.length; i++) {
      
        try {
          // throws Error
          json = fs.readFileSync(path.join(termpath[i], termname) + ".json");
          found = true;
          break;
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
        
      }

      if (!found) {
        throw new NotFoundError(`Terminal ${termname} not found in path ${termpath}.`);
      }
    
    } else if (termname instanceof Buffer) {
      json = termname.toString();
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
  \|/ throws InconsistentError  On unmatching program and output strings
  /|\
  \|/ returns <Array[String|Number]> args  Expected arguments
  /|\
  \*/
  deformat(program, output) {    

    const regex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z]))))/;
    // '
    // For use with String.split
    const splitRegex = /(%(?:(?::?[-+ #]{0,4}(?:d+)?(?:\.\d+)?[doxXs])|(?:[%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))))/; 
    // '
    const printableRegex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%c]))/;
    const conditionalRegex = /%([?te;])/;

    let tokens = program.split(splitRegex).filter(function(value) {
      // Filter out empty tokens
      return value !== "";
    });

    // If there are printing tokens, we will need to extract their values
    if (tokens.some(function(token) {
      return printableRegex.test(token);
    })) {

      let outputRegex = tokens.map(function(token) {
        let regexResult = token.match(printableRegex);
        
        if (regexResult !== null) {
          let operator = regexResult[4] ? regexResult[4] : regexResult[5];

          // Setup a regex group for the token
          switch (operator[0]) {
            case "%":
              return "%";
            case "d":
              return " *([ +-]?[0123456789]+(?:\.[0123456789]+)?) *";
            case "o":
              return " *0?([ +-]?([01234567]+(?:\.[01234567]+)?) *";
            case "x":
            case "X":
              return " *(?:0[xX])?([ +-]?[0123456789abcdefABCDEF]+(?:\.[0123456789abcdefABCDEF]+)?) *";
            case "s":
            case "c":
              return "([^]*)";
          }

        // Still a token, but doesn't print so we don't care
        } else if (regex.test(token)) {
          return "";
        }

        return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // standard recipe for escaping regex
      }).join("");

      // Ensure a string paramater can't consume the entire regex
      outputRegex = "^" + outputRegex + "$";

      let outputResult = output.match(outputRegex);
      if (outputResult === null) {
        throw new InconsistentError(`Output <${output}> is inconsistent with program <${program}>`); // Oops
      }

      // Now we actually modify tokens
      let index = 0;
      tokens = tokens.map(function(token) {
        let regexResult = token.match(printableRegex);
                
        if (regexResult !== null) {
          let operator = regexResult[4] ? regexResult[4] : regexResult[5];
          let outputToken = outputResult[index + 1];

          if (operator[0] !== "%") {
            index++;
          }
          
          // Setup a regex group for the token
          switch (operator[0]) {
            case "d":
              return `%{${parseInt(outputToken, 10)}}`;
            case "o":
              return `%{{parseInt(outputToken, 8)}}`;
            case "x":
            case "X":
              return `%{${parseInt(outputToken, 16)}}`;
            case "s":
            case "c":
              return `%'${outputToken}'`;
          }
        }

        return token;
      });
    }       

    let args = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    let stack = [];
    let executeStack = []; // Responsible for handling if statements

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
        continue;
      }

      let operator = regexResult[4] ? regexResult[4] : regexResult[5];
      
      let pop1, pop2, execute;

      // Note that stack.pop will return undefined if the stack is empty

      switch (operator[0]) {

        // %p[1-9] - set paramater x to pop
        case "p":
          args[parseInt(operator[1], 10) - 1] = stack.pop();
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
          stack.push((stack.pop() || 0) && (stack.pop() || 0) ? 1 : 0);
          break;
          
        // %O - push logical operation of pop or pop
        case "O":
          stack.push((stack.pop() || 0) || (stack.pop() || 0) ? 1 : 0);
          break;
          
        // %! - push unary logical operation of not pop
        case "!":
          stack.push(!(stack.pop() || 0) ? 1 : 0);
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
          executeStack.push(stack.pop().toString() === "0" ? 1 : 0);
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
    }  

    return args;
  }

  /*\
  \|/ method format
  /|\ Format a terminfo parameterized string
  \|/
  /|\ .format(program, ...args)
  \|/
  /|\ <String> program                 Program string to format
  \|/ <String|Number|Boolean> ...args  Arguments to pass to program string
  /|\
  \|/ returns <String> output  Formatted result
  /|\
  \*/
  format(program, ...args) {

    const regex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z]))))/;
    // '
    const splitRegex = /(%(?:(?::?[-+ #]{0,4}(?:\d+)?(?:\.\d+)?[doxXs])|(?:[%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))))/;
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

      let flags = regexResult[1] ? regexResult[1] : "";
      let width = regexResult[2] ? parseInt(regexResult[2], 10) : 0;
      let precision = regexResult[3] ? parseInt(regexResult[3], 10) : 0;
      let operator = regexResult[4] ? regexResult[4] : regexResult[5];

      let result = "";
      let pop1, pop2, execute;

      // Note that stack.pop will return undefined if the stack is empty

      switch (operator[0]) {
      
        // %% - escape precent sign
        case "%":
          result = "%";
          break;
          
        // %[[:]flags][width][.precision]d - pop and print integer as decimal
        case "d":
          // Math.round already does type conversion for u`s
          result = (stack.pop() || 0).toString(10);
          break;
          
        // %[[:]flags][width][.precision]o - pop and print integer as octal
        case "o":
          result = (stack.pop() || 0).toString(8);
          break;
          
        // %[[:]flags][width][.precision]x - pop and print integer as hexadecimal
        case "x":
          result = (stack.pop() || 0).toString(16);
          break;
          
        // %[[:]flags][width][.precision]X - pop and print integer as uppercase hexadecimal
        case "X":
          result = (stack.pop() || 0).toString(16).toUpperCase();
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
          stack.push((stack.pop() || 0) && (stack.pop() || 0) ? 1 : 0);
          break;
          
        // %O - push logical operation of pop or pop
        case "O":
          stack.push((stack.pop() || 0) || (stack.pop() || 0) ? 1 : 0);
          break;
          
        // %! - push unary logical operation of not pop
        case "!":
          stack.push(!(stack.pop() || 0) ? 1 : 0);
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
          executeStack.push(stack.pop().toString() === "0" ? 1 : 0);
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
      if (flags !== "") {
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
      if (precision > result.replace(/[^1234567890abcdef]/gi, "").length) {
        result = "0".repeat(precision - result.replace(/[^1234567890abcdef]/gi, "").length) + result;
      }

      // %n[doxXs] - expand to match at least n characters with leading spaces
      if (width > result.length) {
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
  /|\ <Function> callback  Called on every capability
  \|/   <String> key         Capability name
  /|\   <String> value       Capability value
  \*/
  forEach(callback) {
    this.capabilities.forEach(function(key) {
      let value = this[key];
      callback(key, value);
    }.bind(this));
  }

  /*\
  \|/ method test
  /|\ Test a reverse terminfo parameterized string if it matches the expected output
  \|/
  /|\ .test(program, output)
  \|/
  /|\ <String> program  Program string to test
  \|/ <String> output   Output string to reverse test with program string
  /|\
  \|/ returns <Boolean> result  Result of test
  /|\
  \*/
  test(program, output) {

    const regex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z]))))/;
    // '
    const splitRegex = /(%(?:(?::?[-+ #]{0,4}(?:\d+)?(?:\.\d+)?[doxXs])|(?:[%cl+\-*/m&|^=><AO!~i?te;]|(?:p[1-9])|(?:'[^']+')|(?:{\d+})|(?:(?:P|g)(?:[A-Z]|[a-z])))))/;
    // '
    const printableRegex = /%(?:(?::?([-+ #]{0,4})(\d+)?(?:\.(\d+))?([doxXs]))|([%c]))/;

    let tokens = program.split(splitRegex).filter(function(value) {
      // Filter out empty tokens
      return value !== "";
    });

    // Start by setting up a regex for each token
    let outputRegex = tokens.map(function(token) {
      let regexResult = token.match(printableRegex);
      
      if (regexResult !== null) {
        let operator = regexResult[4] ? regexResult[4] : regexResult[5];

        // Setup a regex group for the token
        switch (operator[0]) {
          case "%":
            return "%";
          case "d":
            return " *([ +-]?[0123456789]+(?:\.[0123456789]+)?) *";
          case "o":
            return " *0?([ +-]?([01234567]+(?:\.[01234567]+)?) *";
          case "x":
          case "X":
            return " *(?:0[xX])?([ +-]?[0123456789abcdefABCDEF]+(?:\.[0123456789abcdefABCDEF]+)?) *";
          case "s":
          case "c":
            return "([^]*)";
        }

      // Still a token, but doesn't print so we don't care
      } else if (regex.test(token)) {
        return "";
      }

      return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // standard recipe for escaping regex
    }).join("");

    // Ensure a string paramater can't consume the entire regex
    outputRegex = "^" + outputRegex + "$";

    return (new RegExp(outputRegex)).test(output);
  }
  
  /*\
  \|/ method toString
  /|\ Stringify capabilities into JSON
  \|/
  /|\ .toString(indent)
  \|/
  /|\ <String|Number> indent  Indent output by this value/amount of spaces
  \|/
  /|\ returns <String> result  JSON result of capabilities
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