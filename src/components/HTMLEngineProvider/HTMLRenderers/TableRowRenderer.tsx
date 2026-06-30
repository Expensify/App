import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';
import {TNodeRenderer} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';

function getElementChildren(node: TNode | null | undefined): TNode[] {
    return node?.children?.filter((child) => !!child.tagName) ?? [];
}

function isLastRowOfTable(tnode: TNode): boolean {
    const section = tnode.parent;
    const table = section?.parent;
    if (!section || !table) {
        return false;
    }
    const sectionRows = getElementChildren(section);
    const tableSections = getElementChildren(table);
    return sectionRows[sectionRows.length - 1] === tnode && tableSections[tableSections.length - 1] === section;
}

function TableRowRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();

    // Header rows (inside <thead>) use header padding; body rows use the compact min-height.
    const isHeaderRow = tnode.parent?.tagName === 'thead';

    // Skip whitespace-only text nodes that sit between cells in the source HTML.
    const cells = tnode.children.filter((child) => !!child.tagName);

    return (
        <View style={[isHeaderRow ? styles.htmlTableHeaderRow : styles.htmlTableRow, isLastRowOfTable(tnode) && styles.htmlTableLastRow]}>
            {cells.map((child, index) => {
                const key = `${child.tagName ?? 'node'}-${index}`;
                return (
                    <TNodeRenderer
                        key={key}
                        tnode={child}
                        renderIndex={index}
                        renderLength={cells.length}
                    />
                );
            })}
        </View>
    );
}

export default TableRowRenderer;
