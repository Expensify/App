"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = promiseSome;
/**
 * Like _.some but for promises. It short-circuts after a promise fulfills with a value that passes the test implemented by provided function.
 * It does not wait for the other promises to complete once it finds one.
 * If no promise passes the provided test, it rejects.
 */
function promiseSome(promises, callbackFn) {
    return new Promise(function (resolve, reject) {
        for (var _i = 0, promises_1 = promises; _i < promises_1.length; _i++) {
            var p = promises_1[_i];
            Promise.resolve(p)
                .then(function (res) {
                if (!callbackFn(res)) {
                    return;
                }
                resolve(true);
            })
                .catch(function () { });
        }
        Promise.allSettled(promises).then(function () { return reject(); });
    });
}
