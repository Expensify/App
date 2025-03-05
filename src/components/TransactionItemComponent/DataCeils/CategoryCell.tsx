import useThemeStyles from '@hooks/useThemeStyles';
import TextWithTooltip from '@components/TextWithTooltip';
import React from 'react';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import * as Expensicons from '@components/Icon/Expensicons';
import colors from '@styles/theme/colors';
import type DataCellProps from './DateCellProps';


function CategoryCell({isLargeScreenWidth, showTooltip, transactionItem}: DataCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.category ?? ""}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter,{color:colors.green800}]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={showTooltip}
            text={transactionItem?.category}
            textStyle={[
                styles.optionDisplayName,
                styles.label,
                styles.pre,
                styles.justifyContentCenter,
                styles.textMicro,
                styles.textSupporting,
                styles.flexShrink1,
                styles.textMicro,
                styles.mnh0,
            ]}
        />
    );
}

CategoryCell.displayName = 'CategoryCell';
export default CategoryCell;
