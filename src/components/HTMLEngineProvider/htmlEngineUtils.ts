import type {TNode} from 'react-native-render-html';
import variables from '@styles/variables';

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
 * Check if a node is a child of a specific tag name by traversing up the parent chain.
 */
function isChildOfTagName(tnode: TNode, tagName: string): boolean {
    if (!tnode.parent) {
        return false;
    }
    if (tnode.parent.tagName === tagName) {
        return true;
    }
    return isChildOfTagName(tnode.parent, tagName);
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

function isChildOfTaskTitle(tnode: TNode): boolean {
    return isChildOfNode(tnode, (node) => node.domNode?.name !== undefined && node.domNode.name.toLowerCase() === 'task-title');
}

/**
 * Check if the parent node has deleted style.
 */
function isDeletedNode(tnode: TNode): boolean {
    const parentStyle = tnode.parent?.styles?.nativeTextRet ?? {};
    return 'textDecorationLine' in parentStyle && parentStyle.textDecorationLine === 'line-through';
}

/**
 * @returns Whether the node is a child of RBR
 */
function isChildOfRBR(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'rbr');
}

function getFontSizeOfRBRChild(tnode: TNode): number {
    if (!tnode.parent) {
        return 0;
    }
    if (tnode.parent.tagName === 'rbr' && tnode.parent.attributes?.issmall !== undefined) {
        return variables.fontSizeSmall;
    }
    if (tnode.parent.tagName === 'rbr' && tnode.parent.attributes?.issmall === undefined) {
        return variables.fontSizeLabel;
    }
    return 0;
}

/**
 * @returns Whether the node is a child of muted-text-label
 */
function isChildOfMutedTextLabel(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'muted-text-label');
}

function isChildOfLabelText(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'label-text');
}

/**
 * @returns Whether the node is a child of muted-text-xs
 */
function isChildOfMutedTextXS(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'muted-text-xs');
}

/**
 * @returns Whether the node is a child of muted-text-micro
 */
function isChildOfMutedTextMicro(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'muted-text-micro');
}

/**
 * @returns Whether the node is a child of alert-text
 */
function isChildOfAlertText(tnode: TNode): boolean {
    return isChildOfTagName(tnode, 'alert-text');
}

export {
    computeEmbeddedMaxWidth,
    isChildOfComment,
    isChildOfH1,
    isDeletedNode,
    isChildOfTaskTitle,
    isChildOfRBR,
    isCommentTag,
    getFontSizeOfRBRChild,
    isChildOfMutedTextLabel,
    isChildOfLabelText,
    isChildOfMutedTextXS,
    isChildOfMutedTextMicro,
    isChildOfAlertText,
};
