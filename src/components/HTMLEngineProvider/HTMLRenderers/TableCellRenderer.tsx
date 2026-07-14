import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import {View} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';

type CellHorizontalAlignment = 'left' | 'center' | 'right';

function getCellHorizontalAlignment(styleAttribute: string | undefined): CellHorizontalAlignment {
    if (styleAttribute?.includes('text-align: right')) {
        return 'right';
    }
    if (styleAttribute?.includes('text-align: center')) {
        return 'center';
    }
    return 'left';
}

function TableCellRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const isHeaderCell = tnode.tagName === 'th';
    const alignment = getCellHorizontalAlignment(tnode.attributes.style);

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
            <Text style={[isHeaderCell ? styles.htmlTableHeaderCellText : styles.htmlTableCellText, textAlignmentStyle]}>
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </View>
    );
}

export default TableCellRenderer;
