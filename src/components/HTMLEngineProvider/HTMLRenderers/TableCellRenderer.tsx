import React from 'react';
import {View} from 'react-native';
import type {FlexStyle, TextStyle} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type CellAlignment = {
    alignItems: FlexStyle['alignItems'];
    textAlign: TextStyle['textAlign'];
};

function getCellAlignment(styleAttribute: string | undefined): CellAlignment {
    if (styleAttribute?.includes('text-align: right')) {
        return {alignItems: 'flex-end', textAlign: 'right'};
    }
    if (styleAttribute?.includes('text-align: center')) {
        return {alignItems: 'center', textAlign: 'center'};
    }
    return {alignItems: 'flex-start', textAlign: 'left'};
}

function TableCellRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const isHeaderCell = tnode.tagName === 'th';
    const {alignItems, textAlign} = getCellAlignment(tnode.attributes.style);

    return (
        <View style={[styles.htmlTableCell, {alignItems}]}>
            <Text style={[isHeaderCell ? styles.htmlTableHeaderCellText : styles.htmlTableCellText, {textAlign}]}>
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </View>
    );
}

export default TableCellRenderer;
