import React from 'react';
import type {ListItem, TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import BaseListItemHeader, {type BaseListItemHeaderProps} from './BaseListItemHeader';

type MerchantListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The merchant currently being looked at */
    merchant: TransactionMerchantGroupListItemType;
};

function MerchantListItemHeader<TItem extends ListItem>({
    merchant: merchantItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: MerchantListItemHeaderProps<TItem>) {
    const {translate} = useLocalize();
    const rawMerchant = merchantItem.formattedMerchant ?? merchantItem.merchant;
    const merchantName = rawMerchant || translate('search.noMerchant');

    return (
        <BaseListItemHeader
            item={merchantItem}
            displayName={merchantName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.MERCHANT}
            onCheckboxPress={onCheckboxPress}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            isSelectAllChecked={isSelectAllChecked}
            isIndeterminate={isIndeterminate}
            isExpanded={isExpanded}
            onDownArrowClick={onDownArrowClick}
            columns={columns}
        />
    );
}

export default MerchantListItemHeader;
