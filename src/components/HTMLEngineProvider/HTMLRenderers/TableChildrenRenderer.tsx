import type {TNode} from 'react-native-render-html';

import {TNodeRenderer} from 'react-native-render-html';

/** Element (non-whitespace) children of a node, skipping whitespace-only text nodes that sit between block elements in the source HTML. */
function getElementChildren(node: TNode | null | undefined): TNode[] {
    return node?.children?.filter((child) => !!child.tagName) ?? [];
}

/**
 * Renders the element children of a table-related node through `TNodeRenderer`, skipping whitespace-only text nodes.
 * Shared by the table, section and row renderers so the filter-and-render logic lives in a single place.
 */
function TableChildrenRenderer({tnode}: {tnode: TNode}) {
    const children = getElementChildren(tnode);
    return (
        <>
            {children.map((child, index) => (
                <TNodeRenderer
                    key={`${child.tagName ?? 'node'}-${index}`}
                    tnode={child}
                    renderIndex={index}
                    renderLength={children.length}
                />
            ))}
        </>
    );
}

export default TableChildrenRenderer;
export {getElementChildren};
