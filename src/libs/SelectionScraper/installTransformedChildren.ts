import type {ChildNode, Document, Element} from 'domhandler';

// Transformed domhandler children need restored ownership and sibling links before serialization.
export default function installTransformedChildren(parent: Document | Element, children: ChildNode[]): void {
    // The helper must update the supplied domhandler parent so it owns the exact transformed child array.
    // eslint-disable-next-line no-param-reassign
    parent.children = children;
    for (const [index, child] of children.entries()) {
        child.parent = parent;
        // Negative indices wrap to the last child, but the first child must have no predecessor.
        // eslint-disable-next-line rulesdir/prefer-at
        child.prev = children[index - 1] ?? null;
        child.next = children.at(index + 1) ?? null;
    }
}
