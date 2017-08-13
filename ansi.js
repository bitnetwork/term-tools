module.exports = {
  // Cursor up
  cuu: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}A`;
  },
  // Cursor down
  cud: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}B`;
  },
  // Cursor forward
  cuf: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}C`;
  },
  // Cursor back
  cub: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}D`;
  },
  // Cursor next line
  cnl: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}E`;
  },
  // Cursor previous line
  cpl: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}F`;
  },
  // Cursor horizontal absolute
  cha: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}G`;
  },
  // Cursor position
  cup: function(row = 1, column = 1) {
    return `\x1b[${row === 1 ? "" : row}${column === 1 ? "" : `;${column}`}H`;
  },
  // Erase in display
  ed: function(type = 2) {
    return `\x1b[${type === 0 ? "" : type}J`;
  },
  // Erase in line
  el: function(type = 2) {
    return `\x1b[${type === 0 ? "" : type}K`;
  },
  // Scroll up
  su: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}S`;
  },
  // Scroll dowm
  sd: function(amount = 1) {
    return `\x1b[${amount === 1 ? "" : amount}T`;
  },
  // Horizontal and vertical position
  hvp: function(row = 1, column = 1) {
    return `\x1b[${row === 1 ? "" : row}${column === 1 ? "" : `;${column}`}f`;
  },
  // Select graphic rendition
  sgr: function(...paramaters) {
    let output = "\x1b[";
    for (let i = 0; i < paramaters.length; i++) {
      output += (i === 0 ? "" : ";") + paramaters[i];
    }
    return output + "m";
  },
  // Device status report
  dsr() {
    return "\x1b[6n";
  },
  // Save cursor position
  scp() {
    return "\x1b[s";
  },
  // Restore cursor position
  rcp() {
    return "\x1b[u";
  },
  // Cursor enable mode
  cem(enable = true) {
    return `\x1b[?25${enable ? "h" : "l"}`;
  },
  // Mouse tracking enable mode
  mtm(enable = true) {
    return `\x1b[?1000${enable ? "h" : "l"}`;
  }
};
