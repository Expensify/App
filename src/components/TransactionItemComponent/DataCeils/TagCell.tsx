import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagForDisplay} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TagCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={shouldShowTooltip}
            text={getTagForDisplay(transactionItem)}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={getTagForDisplay(transactionItem)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    );
}

TagCell.displayName = 'TagCell';
export default TagCell;
