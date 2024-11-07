import type {TNode} from 'react-native-render-html';

type Predicate = (node: TNode) => boolean;

const MAX_IMG_DIMENSIONS = 512;

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
function computeEmbeddedMaxWidth(contentWidth: number, tagName: string): number {
    if (tagName === 'img') {
        return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
    }
    return contentWidth;
}

/**
 * Check if tagName is equal to any of our custom tags wrapping chat comments.
 *
 */
function isCommentTag(tagName: string): boolean {
    return tagName === 'email-comment' || tagName === 'comment';
}

/**
 * Check if there is an ancestor node for which the predicate returns true.
 */
function isChildOfNode(tnode: TNode, predicate: Predicate): boolean {
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
function isChildOfComment(tnode: TNode): boolean {
    return isChildOfNode(tnode, (node) => node.domNode?.name !== undefined && isCommentTag(node.domNode.name));
}

/**
 * Check if there is an ancestor node with the name 'h1'.
 * Finding a node with the name 'h1' flags that we are rendering inside an h1 element.
 */
function isChildOfH1(tnode: TNode): boolean {
    return isChildOfNode(tnode, (node) => node.domNode?.name !== undefined && node.domNode.name.toLowerCase() === 'h1');
}

/**
 * Check if the parent node has deleted style.
 */
function isDeletedNode(tnode: TNode): boolean {
    const parentStyle = tnode.parent?.styles?.nativeTextRet ?? {};
    return 'textDecorationLine' in parentStyle && parentStyle.textDecorationLine === 'line-through';
}

export {computeEmbeddedMaxWidth, isChildOfComment, isCommentTag, isChildOfH1, isDeletedNode};
