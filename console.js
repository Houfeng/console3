const ConsoleBase = require('console').Console;
const util = require('util');
const Class = require('cify').Class;
const color = require('./color');

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
  color: color,
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
        var colorRender = self.color[methodInfo.color];
        return method.call(self, colorRender ? colorRender(text) : text);
      }).bind(self);
    });
  },
  _initColorMethods: function () {
    var self = this;
    for (var name in self.color) {
      self[name] = function (text) {
        self.write(self.color[name](text));
      };
    }
  },
  write: function () {
    this.stdout.write.apply(this.stdout, arguments);
  },
  clear: function () {
    this.write('\u001B[2J\u001B[0;0f');
  },
  table: function () {

  }
});

const console = new Console(process.stdout, process.stderr);
console.Console = Console;

module.exports = console;