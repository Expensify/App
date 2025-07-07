"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldRenderAsText;
var expensify_common_1 = require("expensify-common");
/**
 * Whether to render the report action as text
 */
function shouldRenderAsText(html, text) {
    // On native, we render emoji as text to prevent the large emoji is cut off when the action is edited.
    // More info: https://github.com/Expensify/App/pull/35838#issuecomment-1964839350
    var htmlWithoutLineBreak = expensify_common_1.Str.replaceAll(html, '<br />', '\n');
    var htmlWithoutEmojiOpenTag = expensify_common_1.Str.replaceAll(htmlWithoutLineBreak, '<emoji>', '');
    return expensify_common_1.Str.replaceAll(htmlWithoutEmojiOpenTag, '</emoji>', '') === text;
}
