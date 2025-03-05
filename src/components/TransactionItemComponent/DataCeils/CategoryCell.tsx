import useThemeStyles from '@hooks/useThemeStyles';
import TextWithTooltip from '@components/TextWithTooltip';
import type {TransactionListItemType} from '@components/SelectionList/types';
import React from 'react';
import {Folder} from '@components/Icon/Expensicons';
import {getTagForDisplay} from '@libs/TransactionUtils';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import * as Expensicons from '@components/Icon/Expensicons';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

function CategoryCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.category}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
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
