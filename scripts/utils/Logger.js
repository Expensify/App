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
exports.formatLink = exports.success = exports.error = exports.note = exports.warn = exports.info = exports.log = void 0;
var COLOR_DIM = '\x1b[2m';
var COLOR_RESET = '\x1b[0m';
var COLOR_YELLOW = '\x1b[33m';
var COLOR_RED = '\x1b[31m';
var COLOR_GREEN = '\x1b[32m';
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.debug.apply(console, args);
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
var formatLink = function (name, url) { return "\u001B]8;;".concat(url, "\u001B\\").concat(name, "\u001B]8;;\u001B\\"); };
exports.formatLink = formatLink;
