import { TNode } from 'react-native-render-html';

const MAX_IMG_DIMENSIONS = 512;

/**
 * Compute embedded maximum width from the available screen width. This function
 * is used by the HTML component in the default renderer for img tags to scale
 * down images that would otherwise overflow horizontally.
 *
 * @returns The minimum between contentWidth and MAX_IMG_DIMENSIONS
 */
function computeEmbeddedMaxWidth(contentWidth: number, tagName: string) {
    if (tagName === 'img') {
        return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
    }
    return contentWidth;
}

/**
 * Check if tagName is equal to any of our custom tags wrapping chat comments.
 *
 */
function isCommentTag(tagName?: string) {
    return tagName === 'email-comment' || tagName === 'comment';
}

/**
 * Check if there is an ancestor node for which the predicate returns true.
 */
function isChildOfNode(tnode: TNode, predicate: (node: TNode) => boolean) {
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
 */
function isChildOfComment(tnode: TNode) {
    return isChildOfNode(tnode, (node) => isCommentTag(node.domNode?.name));
}

/**
 * Check if there is an ancestor node with the name 'h1'.
 * Finding a node with the name 'h1' flags that we are rendering inside an h1 element.
 */
function isChildOfH1(tnode : TNode) {
    return isChildOfNode(tnode, (node) => node.domNode?.name.toLowerCase() === 'h1');
}

export {computeEmbeddedMaxWidth, isChildOfComment, isCommentTag, isChildOfH1};
