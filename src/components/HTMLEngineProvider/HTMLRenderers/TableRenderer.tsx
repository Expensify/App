import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeRenderer} from 'react-native-render-html';
import useTheme from '@hooks/useTheme';
import variables from '@styles/variables';

/**
 * Renders an HTML <table> as a styled, highlighted container. The library has no built-in
 * table layout, so children (<thead>/<tbody>) are rendered as stacked blocks and the row/cell
 * layout is handled by the dedicated row and cell renderers.
 */
function TableRenderer({tnode}: CustomRendererProps<TBlock>) {
    const theme = useTheme();

    // Skip whitespace-only text nodes that sit between block elements in the source HTML.
    const sections = tnode.children.filter((child) => !!child.tagName);

    return (
        <View
            style={{
                alignSelf: 'stretch',
                marginVertical: 8,
                borderRadius: variables.componentBorderRadiusNormal,
                backgroundColor: theme.highlightBG,
                overflow: 'hidden',
            }}
        >
            {sections.map((child, index) => {
                const key = `${child.tagName ?? 'node'}-${index}`;
                return (
                    <TNodeRenderer
                        key={key}
                        tnode={child}
                        renderIndex={index}
                        renderLength={sections.length}
                    />
                );
            })}
        </View>
    );
}

export default TableRenderer;
