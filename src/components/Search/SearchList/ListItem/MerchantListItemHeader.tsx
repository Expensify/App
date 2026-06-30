import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionMerchantGroupListItemType} from './types';

type MerchantListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The merchant currently being looked at */
    merchant: TransactionMerchantGroupListItemType;
};

function MerchantListItemHeader({merchant: merchantItem, ...baseProps}: MerchantListItemHeaderProps) {
    // formattedMerchant is already translated to "No merchant" for empty values in SearchUIUtils
    const merchantName = merchantItem.formattedMerchant ?? merchantItem.merchant ?? '';

    return (
        <BaseListItemHeader
            {...baseProps}
            item={merchantItem}
            displayName={merchantName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.MERCHANT}
        />
    );
}

export default MerchantListItemHeader;
