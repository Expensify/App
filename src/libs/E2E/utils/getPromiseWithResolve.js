"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPromiseWithResolve;
function getPromiseWithResolve() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var resolveFn = function (_value) { };
    var promise = new Promise(function (resolve) {
        resolveFn = resolve;
    });
    return [promise, resolveFn];
}
