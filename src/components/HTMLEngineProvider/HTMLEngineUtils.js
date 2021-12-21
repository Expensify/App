/**
 * Check if there is an ancestor node with name 'comment'.
 * Finding node with name 'comment' flags that we are rendering a comment.
 * @param {TNode} tnode
 * @returns {Boolean}
 */
function isInsideComment(tnode) {
    let currentNode = tnode;
    while (currentNode.parent) {
        if (currentNode.domNode.name === 'comment') {
            return true;
        }
        currentNode = currentNode.parent;
    }
    return false;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isInsideComment,
};
