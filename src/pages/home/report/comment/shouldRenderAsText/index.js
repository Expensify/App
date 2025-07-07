"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldRenderAsText;
var expensify_common_1 = require("expensify-common");
/**
 * Whether to render the report action as text
 */
function shouldRenderAsText(html, text) {
    return expensify_common_1.Str.replaceAll(html, '<br />', '\n') === text;
}
