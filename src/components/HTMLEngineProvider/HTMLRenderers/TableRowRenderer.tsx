import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeRenderer} from 'react-native-render-html';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/**
 * Renders an HTML <tr> as a flex row. Each row has a minimum height, horizontal padding and a
 * bottom border to separate it from the next row, matching how our other tables are displayed.
 */
function TableRowRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    // Skip whitespace-only text nodes that sit between cells in the source HTML.
    const cells = tnode.children.filter((child) => !!child.tagName);

    return (
        <View
            style={[
                styles.flexRow,
                styles.alignItemsCenter,
                {
                    minHeight: 40,
                    paddingHorizontal: variables.tableRowPaddingHorizontal,
                    borderBottomWidth: 1,
                    borderColor: theme.border,
                },
            ]}
        >
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
