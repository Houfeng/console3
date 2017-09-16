const ConsoleBase = require('console').Console;
const util = require('util');
const Class = require('cify').Class;
const colors = require('./colors');
const ora = require('ora');
const chalkAnimation = require('chalk-animation');

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

  $extends: ConsoleBase,
  colors: colors,

  constructor: function (stdout, stderr) {
    this.$super(stdout, stderr);
    this.stdout = stdout;
    this.stderr = stderr;
    this._overrideMethods();
    this._initColorMethods();
  },

  _overrideMethods: function () {
    let self = this;
    OVERRIDE_METHOD_INFOS.forEach(function (methodInfo) {
      let method = self[methodInfo.name];
      self[methodInfo.name] = (function () {
        let text = util.format.apply(util, arguments);
        let colorRender = self.colors[methodInfo.color];
        return method.call(self, colorRender ? colorRender(text) : text);
      }).bind(self);
    });
  },

  _initColorMethods: function () {
    let self = this;
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
  },

  loading: function (text, opts) {
    opts = opts || {};
    opts.color = opts.color || 'green';
    opts.textColor = opts.textColor || opts.color;
    let colorRender = this.colors[opts.textColor];
    let spinner = ora(colorRender(text)).start();
    spinner.color = opts.color;
    return spinner;
  },

  animation: function (text, opts) {
    opts = opts || {};
    opts.type = opts.type || 'rainbow';
    let ref = chalkAnimation[opts.type](text);
    return ref;
  }

});

module.exports = new Console(process.stdout, process.stderr);
module.exports.Console = Console;