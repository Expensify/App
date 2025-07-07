"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var polyfillListFormat_1 = require("./polyfillListFormat");
var polyfillNumberFormat_1 = require("./polyfillNumberFormat");
/**
 * Polyfill the Intl API, always performed for native devices.
 */
var intlPolyfill = function () {
    // Native devices require extra polyfills which are
    // not yet implemented in hermes.
    // see support: https://hermesengine.dev/docs/intl/
    require('@formatjs/intl-locale/polyfill-force');
    require('@formatjs/intl-pluralrules/polyfill-force');
    require('@formatjs/intl-pluralrules/locale-data/en');
    require('@formatjs/intl-pluralrules/locale-data/es');
    // Required to polyfill NumberFormat on iOS
    // see: https://github.com/facebook/hermes/issues/1172#issuecomment-1776156538
    (0, polyfillNumberFormat_1.default)();
    (0, polyfillListFormat_1.default)();
};
exports.default = intlPolyfill;
