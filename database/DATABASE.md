# Terminal Database Files

## Capabilities

Name                  | Terminfo          | Notes
--------------------- | ----------------- | ------------------------------------------
description           |                   |
columns               | cols              |
lines                 | lines             |
colors                | colors            |
truecolor             |                   |
--------------------- | ----------------- | ------------------------------------------
bell                  | bel               |
clear                 | clear             | Also moves cursor to (0, 0); (note: \x1b[3J will also clear the scrollback buffer; push into new capability soon)
clearLine             | clr_bol + clr_eol | Also moves cursor to column 0
reset                 | reset_*string     | Good idea to also add resetColor + resetAttribute
enterAlternateBuffer  | smcup             | 
exitAlternateBuffer   | rmcup             | 
enterKeypad           | smkx              | Required to get correct arrow key inputs
exitKeypad            | rmkx              |
enterStatus           | tsl               | Terminfo lacking support
exitStatus            | fsl               | Terminfo lacking support
enterAlternateCharset | smacs             | Allows special characters to be written like box drawing. Use when unicode is not supported.
exitAlternateCharset  | rmacs             |
enterPaste            |                   | Bracketed paste mode; not supported by terminfo
exitPaste             |                   |
beginPaste            |                   | Sent by terminal on paste begin
endPaste              |                   | Sent by terminal on paste end
--------------------- | ----------------- | ------------------------------------------
showCursor            | cnorm             |
hideCursor            | civis             |
changeScrollRegion    | csr               | Paramatized (line1, line2)
--------------------- | ----------------- | ------------------------------------------
moveCursor            | cup               | Paramatized (col, row); zero based
moveColumn            | hpa               | Paramatized (col); zero based; terminfo lacking support
moveRow               |                   | Paramatized (row); zero based
cursorDown            | cud               | Paramatized (amount)
cursorUp              | cuu               | Paramatized (amount)
cursorRight           | cuf               | Paramatized (amount)
cursorLeft            | cub               | Paramatized (amount)
saveCursor            | sc                | 
restoreCursor         | rc                | 
requestCursor         | reqmp             | Terminfo lacking support
reportCursor          |                   | Sent by terminal; Paramatized (row, col)
--------------------- | ----------------- | ------------------------------------------
enterBold             | bold              | 
exitBold              |                   | The standard ansi code doesn't work on xterm and putty
enterDim              | dim               |
exitDim               |                   | This exits both bold and dim
enterReverse          | rev or smso       | 
exitReverse           | rmso              |
enterUnderline        | smul              |
exitUnderline         | rmul              |
enterItalic           | sitm              | 
exitItalic            | ritm              |
enterConceal          | invis             |
exitConceal           |                   |
enterBlink            | blink             |
exitBlink             |                   |
enterStrikethrough    |                   | Terminfo has no support
exitStrikethrough     |                   | Terminfo has no support
resetAttribute        | sgr0              | 
--------------------- | ----------------- | ------------------------------------------
setForeground         | setaf or setf     | Paramatized (id)
setBackground         | setab or setb     | Paramatized (id)
setForegroundClear    |                   | Terminfo has no support
setBackgroundClear    |                   | Terminfo has no support
setForegroundTrue     |                   | Terminfo has no support; paramatized (r, g, b)
setBackgroundTrue     |                   | Terminfo has no support; paramatized (r, g, b)
setPair               | initc             | Paramatized (id, r, g, b); color values range from 0-1000 in terminfo
resetColor            | oc                | Also do set*groundClear
--------------------- | ----------------- | ------------------------------------------
enterMouse            | XM(1)             | Terminfo lacking support; default to xterm; new entry paramatized (type); type = 0: click, 1: click+drag, 2: click+drag+move
exitMouse             | XM(0)             |
keyMouse              |                   | Sent by terminal; Paramatized (row, col)