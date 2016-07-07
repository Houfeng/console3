const ConsoleBase = require('console').Console;
const util = require('util');
const Class = require('cify').Class;
const colors = require('colors');
require('console.table');

const OVERRIDE_METHOD_INFOS = [
  {
    name: 'info',
    color: 'green'
  },
  {
    name: 'warn',
    color: 'yellow'
  },
  {
    name: 'error',
    color: 'red'
  }
];

const Console = new Class({
  _extends: ConsoleBase,
  colors: colors,
  constructor: function (stdout, stderr) {
    this.stdout = stdout;
    this.stderr = stderr;
    this._overrideMethods();
    this._initColorMethods();
  },
  _overrideMethods: function () {
    var self = this;
    OVERRIDE_METHOD_INFOS.forEach(function (methodInfo) {
      var method = self[methodInfo.name];
      self[methodInfo.name] = (function () {
        var text = util.format.apply(util, arguments);
        var colorRender = self.colors[methodInfo.color];
        return method.call(self, colorRender ? colorRender(text) : text);
      }).bind(self);
    });
  },
  _initColorMethods: function () {
    var self = this;
    Object.getOwnPropertyNames(self.colors).forEach(function (name) {
      self[name] = function (text) {
        text = String(text);
        self.write(self.colors[name](text));
      };
    });
  },
  write: function () {
    this.stdout.write.apply(this.stdout, arguments);
  },
  clear: function () {
    this.write('\u001B[2J\u001B[0;0f');
  },
  table: function () {
    console.table.apply(this, arguments);
  }
});

module.exports = new Console(process.stdout, process.stderr);
module.exports.Console = Console;