"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var Logger = require("./logger");
/**
 * Executes a command none-blocking by wrapping it in a promise.
 * In addition to the promise it returns an abort function.
 */
exports.default = (function (command, env) {
    if (env === void 0) { env = {}; }
    var childProcess;
    var promise = new Promise(function (resolve, reject) {
        var finalEnv = __assign(__assign({}, process.env), env);
        Logger.note(command);
        childProcess = (0, child_process_1.exec)(command, {
            maxBuffer: 1024 * 1024 * 10, // Increase max buffer to 10MB, to avoid errors
            env: finalEnv,
        }, function (error, stdout) {
            if (error) {
                if (error === null || error === void 0 ? void 0 : error.killed) {
                    resolve();
                }
                else {
                    Logger.error("failed with error: ".concat(error.message));
                    reject(error);
                }
            }
            else {
                Logger.writeToLogFile(stdout);
                resolve(stdout);
            }
        });
    });
    promise.abort = function () {
        childProcess.kill('SIGINT');
    };
    return promise;
});
