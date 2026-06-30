import React from 'react';
import {View} from 'react-native';
import type {FlexStyle, TextStyle} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type CellAlignment = {
    alignItems: FlexStyle['alignItems'];
    textAlign: TextStyle['textAlign'];
};

/**
 * Reads the column alignment that Parsedown emits as an inline `text-align` style on table cells.
 * Inline CSS processing is disabled on the render engine, so the style attribute is parsed here.
 */
function getCellAlignment(styleAttribute: string | undefined): CellAlignment {
    if (styleAttribute?.includes('text-align: right')) {
        return {alignItems: 'flex-end', textAlign: 'right'};
    }
    if (styleAttribute?.includes('text-align: center')) {
        return {alignItems: 'center', textAlign: 'center'};
    }
    return {alignItems: 'flex-start', textAlign: 'left'};
}

/**
 * Renders an HTML <th> or <td>. Cells share the row width equally; header cells use the smaller
 * label font and bold weight, while body cells use the normal message font.
 */
function TableCellRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const isHeaderCell = tnode.tagName === 'th';
    const {alignItems, textAlign} = getCellAlignment(tnode.attributes.style);

    return (
        <View style={[styles.flex1, {alignItems, paddingVertical: variables.tableRowPaddingVertical, paddingEnd: 8}]}>
            <Text
                style={[
                    isHeaderCell ? styles.textBold : {},
                    {
                        color: theme.text,
                        fontSize: isHeaderCell ? variables.fontSizeLabel : variables.fontSizeNormal,
                        textAlign,
                    },
                ]}
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </View>
    );
}

export default TableCellRenderer;
