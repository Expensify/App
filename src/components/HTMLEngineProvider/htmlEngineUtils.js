"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEmbeddedMaxWidth = computeEmbeddedMaxWidth;
exports.isChildOfComment = isChildOfComment;
exports.isChildOfH1 = isChildOfH1;
exports.isDeletedNode = isDeletedNode;
exports.isChildOfTaskTitle = isChildOfTaskTitle;
exports.isChildOfRBR = isChildOfRBR;
exports.isCommentTag = isCommentTag;
exports.getFontSizeOfRBRChild = getFontSizeOfRBRChild;
var variables_1 = require("@styles/variables");
var MAX_IMG_DIMENSIONS = 512;
/**
 * Compute embedded maximum width from the available screen width. This function
 * is used by the HTML component in the default renderer for img tags to scale
 * down images that would otherwise overflow horizontally.
 *
 * @param contentWidth - The content width provided to the HTML
 * component.
 * @param tagName - The name of the tag for which max width should be constrained.
 * @returns The minimum between contentWidth and MAX_IMG_DIMENSIONS
 */
function computeEmbeddedMaxWidth(contentWidth, tagName) {
    if (tagName === 'img') {
        return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
    }
    return contentWidth;
}
/**
 * Check if tagName is equal to any of our custom tags wrapping chat comments.
 *
 */
function isCommentTag(tagName) {
    return tagName === 'email-comment' || tagName === 'comment';
}
/**
 * Check if there is an ancestor node for which the predicate returns true.
 */
function isChildOfNode(tnode, predicate) {
    var currentNode = tnode.parent;
    while (currentNode) {
        if (predicate(currentNode)) {
            return true;
        }
        currentNode = currentNode.parent;
    }
    return false;
}
/**
 * Check if there is an ancestor node with name 'comment'.
 * Finding node with name 'comment' flags that we are rendering a comment.
 */
function isChildOfComment(tnode) {
    return isChildOfNode(tnode, function (node) { var _a; return ((_a = node.domNode) === null || _a === void 0 ? void 0 : _a.name) !== undefined && isCommentTag(node.domNode.name); });
}
/**
 * Check if there is an ancestor node with the name 'h1'.
 * Finding a node with the name 'h1' flags that we are rendering inside an h1 element.
 */
function isChildOfH1(tnode) {
    return isChildOfNode(tnode, function (node) { var _a; return ((_a = node.domNode) === null || _a === void 0 ? void 0 : _a.name) !== undefined && node.domNode.name.toLowerCase() === 'h1'; });
}
function isChildOfTaskTitle(tnode) {
    return isChildOfNode(tnode, function (node) { var _a; return ((_a = node.domNode) === null || _a === void 0 ? void 0 : _a.name) !== undefined && node.domNode.name.toLowerCase() === 'task-title'; });
}
/**
 * Check if the parent node has deleted style.
 */
function isDeletedNode(tnode) {
    var _a, _b, _c;
    var parentStyle = (_c = (_b = (_a = tnode.parent) === null || _a === void 0 ? void 0 : _a.styles) === null || _b === void 0 ? void 0 : _b.nativeTextRet) !== null && _c !== void 0 ? _c : {};
    return 'textDecorationLine' in parentStyle && parentStyle.textDecorationLine === 'line-through';
}
/**
 * @returns Whether the node is a child of RBR
 */
function isChildOfRBR(tnode) {
    if (!tnode.parent) {
        return false;
    }
    if (tnode.parent.tagName === 'rbr') {
        return true;
    }
    return isChildOfRBR(tnode.parent);
}
function getFontSizeOfRBRChild(tnode) {
    var _a, _b;
    if (!tnode.parent) {
        return 0;
    }
    if (tnode.parent.tagName === 'rbr' && ((_a = tnode.parent.attributes) === null || _a === void 0 ? void 0 : _a.issmall) !== undefined) {
        return variables_1.default.fontSizeSmall;
    }
    if (tnode.parent.tagName === 'rbr' && ((_b = tnode.parent.attributes) === null || _b === void 0 ? void 0 : _b.issmall) === undefined) {
        return variables_1.default.fontSizeLabel;
    }
    return 0;
}
