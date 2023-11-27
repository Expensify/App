import lodashGet from 'lodash/get';

const MAX_IMG_DIMENSIONS = 512;

/**
 * Compute embedded maximum width from the available screen width. This function
 * is used by the HTML component in the default renderer for img tags to scale
 * down images that would otherwise overflow horizontally.
 *
 * @param {string} tagName - The name of the tag for which max width should be constrained.
 * @param {number} contentWidth - The content width provided to the HTML
 * component.
 * @returns {number} The minimum between contentWidth and MAX_IMG_DIMENSIONS
 */
function computeEmbeddedMaxWidth(tagName, contentWidth) {
    if (tagName === 'img') {
        return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
    }
    return contentWidth;
}

/**
 * Check if tagName is equal to any of our custom tags wrapping chat comments.
 *
 * @param {string} tagName
 * @returns {Boolean}
 */
function isCommentTag(tagName) {
    return tagName === 'email-comment' || tagName === 'comment';
}

/**
 * Check if there is an ancestor node for which the predicate returns true.
 *
 * @param {TNode} tnode
 * @param {Function} predicate
 * @returns {Boolean}
 */
function isChildOfNode(tnode, predicate) {
    let currentNode = tnode.parent;
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
 * @param {TNode} tnode
 * @returns {Boolean}
 */
function isChildOfComment(tnode) {
    return isChildOfNode(tnode, (node) => isCommentTag(lodashGet(node, 'domNode.name', '')));
}

/**
 * Check if there is an ancestor node with the name 'h1'.
 * Finding a node with the name 'h1' flags that we are rendering inside an h1 element.
 * @param {TNode} tnode
 * @returns {Boolean}
 */
function isChildOfH1(tnode) {
    return isChildOfNode(tnode, (node) => lodashGet(node, 'domNode.name', '').toLowerCase() === 'h1');
}

export {computeEmbeddedMaxWidth, isChildOfComment, isCommentTag, isChildOfH1};
