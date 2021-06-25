'use strict';

var shellEscape = require('shell-escape');
var Promise     = require('rsvp').Promise;
var dargs       = require('dargs');
var exec        = require('child_process').exec;

module.exports = {
  runFunction: runFunction,

  runCommand: runCommand,

  buildCommand: buildCommand,

  formatArgs: formatArgs,
};

/**
  Runs a function...

  @method runFunction
  @param {Function} fn
*/
function runFunction(fn) {
  return fn.call(null);
}

/**
  @method runCommand

  @param {String} command The command to be run
  @param {Object} log The interface that handles stdin/stdout

*/
function runCommand(command, fail, log) {
  return new Promise(function(resolve, reject) {
      if (!command) {
        return resolve('No command found');
      }

      log(command);

      var task = exec(command, {
        cwd: process.cwd()
      }, function(err, stdout, stderr) {
        log(stdout);

        if (err) {
          log(stderr, { color: 'red' });
        }
      });

      task.on('exit', function(code) {
        if (code !== 0 && fail) {
          reject(code);
        }

        resolve(command);
        process.stdin.end();
      });

      process.stdin.pipe(task.stdin, { end: false });
    });
}

/*
  Converts a task:
  ```
    {
      command: 'curl',
      options: {
        form: ['file=@dist/index.html', 'version=new'],
        request: 'POST',
        url: 'api.com/new-release'
      }
    }
  ```
  into a String that serves as a command.

  @method buildCommand
  @param {Object} task
  @return {String} Formatted command line argument

*/
function buildCommand(task) {
  var command = task.command.trim();
  var options = task.options || {};

  var args = dargs(options);

  var formattedArgs = formatArgs(args);
  var commandArgs = !!formattedArgs ? (' ' + formattedArgs) : '';
  var fullCommand = command + commandArgs;

  return fullCommand;
}

/**
  Turns an array of `key=value` into proper command-line arguments and flags.
  `['foo=bar', 'header=x-update: 1', '--truthy']` becomes:
  `--foo bar --header "x-update: 1" --truthy`

  @method formatArgs
  @param {Array} args An array of `key=value` pairs.
  @return {String} command line arguments

*/
function formatArgs(args) {
  args = args || [];
  var split, formattedArgs = [];

  args.forEach(function(arg) {
    split = arg.split(/\=(.+)?/, 2);

    formattedArgs.push(split[0]);

    if (split[1]) {
      formattedArgs.push(split[1]);
    }
  });

  return shellEscape(formattedArgs);
}