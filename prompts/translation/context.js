"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var dedent_1 = require("@libs/StringUtils/dedent");
function default_1(context) {
    if (!context) {
        return '';
    }
    return (0, dedent_1.default)("\n        When translating this phrase, consider this additional context which clarifies the intended meaning:\n\n        ".concat(context, "\n    "));
}
