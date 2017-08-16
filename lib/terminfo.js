const fs = require("fs");

class Terminfo {
  constructor(name = process.env.TERM, path = "/usr/share/terminfo/") {
    let buffer;
    
    try {
      buffer = fs.readFileSync(path + name[0] + "/" + name);
    } catch (error) {
      throw new Error("Terminal capibilites not found in database");
    }
    
    let offset = 0;
    let definitions = {
      boolean: [
        "autoLeftMargin",
        "autoRightMargin",
        "noEscCtrlc",
        "ceolStandoutGlitch",
        "eatNewlineGlitch",
        "eraseOverstrike",
        "genericType",
        "hardCopy",
        "hasMetaKey",
        "hasStatusLine",
        "insertNullGlitch",
        "memoryAbove",
        "memoryBelow",
        "moveInsertMode",
        "moveStandoutMode",
        "overStrike",
        "statusLineEscOk",
        "destTabsMagicSmso",
        "tildeGlitch",
        "transparentUnderline",
        "xonXoff",
        "needsXonXoff",
        "prtrSilent",
        "hardCursor",
        "nonRevRmcup",
        "noPadChar"
      ],
      number: [
        "columns",
        "initTabs",
        "lines",
        "linesOfMemory",
        "magicCookieGlitch",
        "paddingBaudRate",
        "virtualTerminal",
        "widthStatusLine",
        "numLabels",
        "labelHeight",
        "labelWidth",
        "maxAttributes",
        "maximumWindows",
        "maxColors",
        "maxPairs",
        "noColorVideo",
        "bufferCapacity",
        "dotVertSpacing",
        "dotHorzSpacing",
        "maxMicroAddress",
        "maxMicroJump",
        "microColSize",
        "microLineSize",
        "numberOfPins",
        "outputResChar",
        "outputResLine",
        "outputResHorzInch",
        "outputResVertInch",
        "printRate",
        "wideCharSize",
        "buttons",
        "bitImageEntwining",
        "bitImageType"
      ],
      string: [
        "backTab",
        "bell",
        "carriageReturn",
        "changeScrollRegion",
        "clearAllTabs",
        "clearScreen"
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
      // if (number !== -1) {
        this.capabilities[definitions.number[i]] = number;
      // }
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
        console.log(`${stringOffset} - ${stringLength}`)
        this.capabilities[definitions.string[i]] = buffer.toString("ascii", offset + (sizes.string * 2) + stringOffset, offset + (sizes.string * 2) + stringOffset + stringLength);
      } else {
        this.capabilities[definitions.string[i]] = "";
      }
    }
  }
}

module.exports = Terminfo;
