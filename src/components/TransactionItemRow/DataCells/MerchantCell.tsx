import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMerchant} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

function MerchantCell({transactionItem, shouldShowTooltip}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    const merchantName = getMerchant(transactionItem);
    const merchantToDisplay = merchantName === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? '' : merchantName;

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={merchantToDisplay}
            style={[styles.pre, styles.justifyContentCenter]}
        />
    );
}

MerchantCell.displayName = 'MerchantCell';
export default MerchantCell;
