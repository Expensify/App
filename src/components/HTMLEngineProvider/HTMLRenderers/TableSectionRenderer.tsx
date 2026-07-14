import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import React from 'react';
import {TNodeRenderer} from 'react-native-render-html';

/**
 * Renders an HTML <thead>/<tbody> by rendering its <tr> children directly into the table
 * container, without adding an extra wrapping view, so rows stack with no gaps.
 */
function TableSectionRenderer({tnode}: CustomRendererProps<TBlock>) {
    // Skip whitespace-only text nodes that sit between rows in the source HTML.
    const rows = tnode.children.filter((child) => !!child.tagName);

    return (
        <>
            {rows.map((child, index) => {
                const key = `${child.tagName ?? 'node'}-${index}`;
                return (
                    <TNodeRenderer
                        key={key}
                        tnode={child}
                        renderIndex={index}
                        renderLength={rows.length}
                    />
                );
            })}
        </>
    );
}

export default TableSectionRenderer;
