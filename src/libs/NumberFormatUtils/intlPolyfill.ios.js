"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IntlPolyfill_1 = require("@libs/IntlPolyfill");
// On iOS, polyfills from `additionalSetup` are applied after memoization, which results in incorrect cache entry of `Intl.NumberFormat` (e.g. lacking `formatToParts` method).
// To fix this, we need to apply the polyfill manually before memoization.
// For further information, see: https://github.com/Expensify/App/pull/43868#issuecomment-2217637217
var initPolyfill = function () {
    (0, IntlPolyfill_1.default)();
};
exports.default = initPolyfill;
