/**
 * Decorative section labels share the table's gutters and live row width without becoming selectable data rows.
 */
import TextWithTooltip from '@components/TextWithTooltip';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import {useTableContext} from './TableContext';

type TableSectionHeaderProps = {
    text: string;
    rowIndex: number;
};

function TableSectionHeader({text, rowIndex}: TableSectionHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {pageGutterMargin} = useLayoutSpacing();
    const {rowWidth, shouldUseNarrowTableLayout} = useTableContext();

    return (
        <View
            style={[
                pageGutterMargin,
                !!rowWidth && StyleUtils.getWidthStyle(rowWidth),
                styles.pv2,
                // Match TableRow's content padding, including medium screens that use a compact table but wide page gutters.
                shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
                StyleUtils.getBackgroundColorStyle(theme.hoverComponentBG),
                rowIndex === 0 ? styles.borderBottom : styles.borderTop,
            ]}
        >
            <TextWithTooltip
                text={text}
                style={[styles.textMicroBoldSupporting, styles.lh14]}
            />
        </View>
    );
}

export default TableSectionHeader;
