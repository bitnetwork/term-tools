# Terminal Database Files

## Paramatized Strings
Strings may be paramatized (indicated in the notes), in which they will accept
either some numbers or strings as paramaters.

Token | Description
----- | -----------------------------------------
%%    | Output a literal precent character
%d    | Pop number on the stack and print it
%o    | Pop number on the stack and print it in octal
%x    | Pop number on the stack and print it in hexadecimal
%X    | Pop number on the stack and print it in hexadecimal with uppercase digits
%s    | Pop string on the stack and print it
%c    | Pop character on the stack and print it
----- | -----------------------------------------
%px   | Push paramater x (1-9) onto the stack
%i    | Increment the first two paramaters
%Px   | Set variable x (A-Za-z) to pop (persists between calls to format)
%g    | Push variable x (A-Za-z) onto the stack
%'c'  | Push constant string c onto the stack (although it should only be a character, strings are supported)
%{nn} | Push constant number n onto the stack
%l    | Push the length of pop onto the stack (works for numbers)
----- | -----------------------------------------
%+    | Push the sum of pop + pop
%-    | Push the difference of pop2 - pop1 (pop1 was the last value, pop2 was the second last)
%*    | Push the product of pop * pop
%/    | Push the quotient of pop2 / pop1 (if dividing by zero, push 0)
%m    | Push the modulus of pop2 % pop1 (if dividing by zero, push 0)
%&    | Push bitwise and of pop & pop
%\|    | Push bitwise or of pop \| pop
%^    | Push bitwise xor of pop ^ pop
%~    | Push bitwise not of ~pop
----- | -----------------------------------------
%A    | Push logical and of pop && pop
%O    | Push logical or of pop \|\| pop
%!    | Push logical not of !pop
%=    | Push logical equals of pop2 === pop1
%>    | Push logical greater than of pop2 > pop1
%<    | Push logical lesser than of pop2 < pop1
%?    | Initalize a conditional statement
%t    | If pop is true, continue executing, else skip until the next conditional token
%e    | Continue executing unless a condition has been met
%;    | Finialize a conditional statement

### Reverse Mode
Reverse mode is used in both deformat and test methods, and consists of a
slightly different syntax.

Retriving printed items is not supported in a conditional body.

Token | Description
----- | -----------------------------------------
%d    | Push printed number onto the stack
%o    | Push printed octal number onto the stack
%x    | Push printed hexadecimal number onto the stack
%X    | Push printed hexadecimal number onto the stack
%s    | Push printed string onto the stack
%c    | Push printed character onto the stack
%px   | Set paramater x (1-9) to pop

## Terminals

Flags are a=ansi, c=8 bit color, 6=16 bit color, 2=256 bit color, t=truecolor, m=mouse, u=unicode

Name                  | Flags | Description/Notes
--------------------- | ----- | ------------------------------------------
ansi                  | ac    | Ansi compatible terminal with color
dtterm                | ac    | CDE desktop terminal
dumb                  |       | Dumb 80 column terminal
eterm-color           | ac    | Emacs terminal emulator
linux                 | ac    | Linux vitural console
konsole               | ac  u | Konsole terminal emulator
konsole-16color       | a6  u | 
konsole-256color      | a2t u |
nsterm                | a2    | Terminal.app (OSX) terminal; inline image support
putty                 | ac    | PuTTY terminal
putty-256color        | a2    | 
rxvt                  | ac    | Rxvt terminal
rxvt-256color         | a2    | 
rxvt-unicode          | ac  u | 
rxvt-unicode-256color | a2  u | 
screen                | a     | Screen terminal multiplexer
screen-256color       | a2    | 
tmux                  | ac    | Tmux terminal multiplexer
tmux-256color         | a2    | 
vt100                 | a     | dec vt100 With advanced video
vt102                 | a     | dec vt102
vt52                  | a     | dec vt52
xterm                 | ac m  | Xterm terminal emulator
xterm-16color         | a6 m  | 
xterm-256color        | a2tm  | Supports (user) hyperlinks
xterm+256color        | a2 m  | Same as xterm-256color
xterm-color           | ac m  | 
xterm-new             | ac m  | 

### Windows
As it stands, there is no support for windows terminals.
There are more or less 2 capability versions for windows terminals being the old
windows 7 terminal with ansi support, and the latest being almost purly xterm.

If there are issues we can use cygwin (in a older version of terminfo, check out
/lib/vendor/terminfo/@61a88b7), although may be lacking some capabilities.
Another option is interix, although it appears that is even older.

## Capabilities
A set of capabilities support in the database, along with their terminfo counterpart.

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
alternateCharset      | acsc              | This is a object mapping a unicode character to a character used after switching charsets
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
setPair               | initc             | Paramatized (id, r, g, b); color values range from 0-1000 in terminfo, change to 0-255
resetColor            | oc                | Also do set*groundClear
--------------------- | ----------------- | ------------------------------------------
enterMouse            | XM(1)             | Terminfo lacking support; default to xterm; new entry paramatized (type); type = 0: click, 1: click+drag, 2: click+drag+move
exitMouse             | XM(0)             |
keyMouse              |                   | Sent by terminal; Paramatized (row, col)