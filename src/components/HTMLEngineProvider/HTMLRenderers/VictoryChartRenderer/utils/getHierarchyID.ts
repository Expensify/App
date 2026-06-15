import type {TNode} from '@native-html/render';

/**
 * Get a node's unique ID based on its position in the HTML hierarchy.
 */
function getHierarchyID(tnode: TNode): string {
    let id = String(tnode.nodeIndex);
    let parent = tnode.parent;
    while (parent) {
        id = `${parent.nodeIndex}-${id}`;
        parent = parent.parent;
    }
    return id;
}

export default getHierarchyID;
