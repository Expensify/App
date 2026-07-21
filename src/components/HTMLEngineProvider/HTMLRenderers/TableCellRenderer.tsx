import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import {useContext} from 'react';
import {View} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';

import type {CellHorizontalAlignment} from './TableColumnAlignmentContext';

import {getElementChildren} from './TableChildrenRenderer';
import TableColumnAlignmentContext from './TableColumnAlignmentContext';

/** Reads an explicit `text-align` from the cell's inline style, if the HTML happens to carry one. */
function getExplicitCellAlignment(styleAttribute: string | undefined): CellHorizontalAlignment | undefined {
    if (styleAttribute?.includes('text-align: right')) {
        return 'right';
    }
    if (styleAttribute?.includes('text-align: center')) {
        return 'center';
    }
    if (styleAttribute?.includes('text-align: left')) {
        return 'left';
    }
    return undefined;
}

function TableCellRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const columnAlignments = useContext(TableColumnAlignmentContext);
    const isHeaderCell = tnode.tagName === 'th';

    // An explicit style wins; otherwise fall back to the column alignment derived by the table renderer.
    // Guard the index so an unexpected -1 (cell without a parent row) does not wrap around to the last column.
    const columnIndex = getElementChildren(tnode.parent).indexOf(tnode);
    const columnAlignment = columnIndex >= 0 ? columnAlignments.at(columnIndex) : undefined;
    const alignment = getExplicitCellAlignment(tnode.attributes.style) ?? columnAlignment ?? 'left';

    // Map the cell alignment to the shared named styles instead of building inline style objects.
    const cellAlignmentStyle = {
        left: styles.alignItemsStart,
        center: styles.alignItemsCenter,
        right: styles.alignItemsEnd,
    }[alignment];
    const textAlignmentStyle = {
        left: styles.textAlignLeft,
        center: styles.textAlignCenter,
        right: styles.textAlignRight,
    }[alignment];

    return (
        <View style={[styles.htmlTableCell, cellAlignmentStyle]}>
            <Text
                numberOfLines={1}
                style={[isHeaderCell ? styles.htmlTableHeaderCellText : styles.htmlTableCellText, textAlignmentStyle]}
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </View>
    );
}

export default TableCellRenderer;
