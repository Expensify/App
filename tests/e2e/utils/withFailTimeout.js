"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
var TIMEOUT = Number(process.env.INTERACTION_TIMEOUT || config_1.default.INTERACTION_TIMEOUT);
var withFailTimeout = function (promise, name) {
    var timeoutId;
    var resetTimeout = function () {
        clearTimeout(timeoutId);
    };
    var race = new Promise(function (resolve, reject) {
        timeoutId = setTimeout(function () {
            reject(new Error("\"".concat(name, "\": Interaction timed out after ").concat((TIMEOUT / 1000).toFixed(0), "s")));
        }, TIMEOUT);
        promise
            .then(function (value) {
            resolve(value);
        })
            .catch(function (e) {
            reject(e);
        })
            .finally(function () {
            resetTimeout();
        });
    });
    return { promise: race, resetTimeout: resetTimeout };
};
exports.default = withFailTimeout;
