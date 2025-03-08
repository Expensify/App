import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagForDisplay} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TagCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionDataCellProps) {
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
