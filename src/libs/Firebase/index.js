"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Web does not use Firebase for performance tracing */
var startTrace = function () { };
var stopTrace = function () { };
var log = function () { };
exports.default = {
    startTrace: startTrace,
    stopTrace: stopTrace,
    log: log,
};
