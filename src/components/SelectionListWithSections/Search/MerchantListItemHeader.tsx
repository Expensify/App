import React from 'react';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem, TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import BaseListItemHeader from './BaseListItemHeader';

type MerchantListItemHeaderProps<TItem extends ListItem> = {
    /** The merchant currently being looked at */
    merchant: TransactionMerchantGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback for when the down arrow is clicked */
    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** The visible columns for the header */
    columns?: SearchColumnType[];
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
