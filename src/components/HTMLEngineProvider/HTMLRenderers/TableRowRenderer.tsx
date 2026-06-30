import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeRenderer} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';

function TableRowRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();

    // Header rows (inside <thead>) use header padding; body rows use the compact min-height.
    const isHeaderRow = tnode.parent?.tagName === 'thead';

    // Skip whitespace-only text nodes that sit between cells in the source HTML.
    const cells = tnode.children.filter((child) => !!child.tagName);

    return (
        <View style={isHeaderRow ? styles.htmlTableHeaderRow : styles.htmlTableRow}>
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
