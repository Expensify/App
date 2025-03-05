import useThemeStyles from '@hooks/useThemeStyles';
import TextWithTooltip from '@components/TextWithTooltip';
import {getTagForDisplay} from '@libs/TransactionUtils';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TransactionListItemType} from '@components/SelectionList/types';
import React from 'react';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

function TagCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={getTagForDisplay(transactionItem)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={showTooltip}
            text={getTagForDisplay(transactionItem)}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    );
}

TagCell.displayName = 'TagCell';
export default TagCell;
