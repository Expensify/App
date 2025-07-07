"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToLogFile = exports.success = exports.error = exports.note = exports.warn = exports.info = exports.log = void 0;
/* eslint-disable import/no-import-module-exports */
var fs_1 = require("fs");
var path_1 = require("path");
var config_1 = require("../config");
var COLOR_DIM = '\x1b[2m';
var COLOR_RESET = '\x1b[0m';
var COLOR_YELLOW = '\x1b[33m';
var COLOR_RED = '\x1b[31m';
var COLOR_GREEN = '\x1b[32m';
var getDateString = function () { return "[".concat(Date(), "] "); };
var writeToLogFile = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!fs_1.default.existsSync(config_1.default.LOG_FILE)) {
        // Check that the directory exists
        var logDir = path_1.default.dirname(config_1.default.LOG_FILE);
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir);
        }
        fs_1.default.writeFileSync(config_1.default.LOG_FILE, '');
    }
    fs_1.default.appendFileSync(config_1.default.LOG_FILE, "".concat(args
        .map(function (arg) {
        if (typeof arg === 'string') {
            // Remove color codes from arg, because they are not supported in log files
            // eslint-disable-next-line no-control-regex
            return arg.replace(/\x1b\[\d+m/g, '');
        }
        return arg;
    })
        .join(' ')
        .trim(), "\n"));
};
exports.writeToLogFile = writeToLogFile;
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var argsWithTime = __spreadArray([getDateString()], args, true);
    console.debug.apply(console, argsWithTime);
    writeToLogFile.apply(void 0, argsWithTime);
};
exports.log = log;
var info = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    log.apply(void 0, __spreadArray(['▶️'], args, false));
};
exports.info = info;
var success = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var lines = __spreadArray(__spreadArray(['✅', COLOR_GREEN], args, true), [COLOR_RESET], false);
    log.apply(void 0, lines);
};
exports.success = success;
var warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var lines = __spreadArray(__spreadArray(['⚠️', COLOR_YELLOW], args, true), [COLOR_RESET], false);
    log.apply(void 0, lines);
};
exports.warn = warn;
var note = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var lines = __spreadArray(__spreadArray([COLOR_DIM], args, true), [COLOR_RESET], false);
    log.apply(void 0, lines);
};
exports.note = note;
var error = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var lines = __spreadArray(__spreadArray(['🔴', COLOR_RED], args, true), [COLOR_RESET], false);
    log.apply(void 0, lines);
};
exports.error = error;
