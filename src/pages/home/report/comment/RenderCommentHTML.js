"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RenderHTML_1 = require("@components/RenderHTML");
function RenderCommentHTML(_a) {
    var html = _a.html, source = _a.source, containsOnlyEmojis = _a.containsOnlyEmojis;
    var commentHtml = source === 'email' ? "<email-comment ".concat(containsOnlyEmojis ? 'islarge' : '', ">").concat(html, "</email-comment>") : "<comment ".concat(containsOnlyEmojis ? 'islarge' : '', ">").concat(html, "</comment>");
    return <RenderHTML_1.default html={commentHtml}/>;
}
RenderCommentHTML.displayName = 'RenderCommentHTML';
exports.default = RenderCommentHTML;
