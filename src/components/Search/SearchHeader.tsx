import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {SearchQuery, SelectedTransactions} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchHeaderProps = {
    query: SearchQuery;
    selectedItems: SelectedTransactions;
};

function SearchHeader({query, selectedItems}: SearchHeaderProps) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const headerContent: {[key in SearchQuery]: {icon: IconAsset; title: string}} = {
        all: {icon: Illustrations.MoneyReceipts, title: translate('common.expenses')},
        shared: {icon: Illustrations.SendMoney, title: translate('common.shared')},
        drafts: {icon: Illustrations.Pencil, title: translate('common.drafts')},
        finished: {icon: Illustrations.CheckmarkCircle, title: translate('common.finished')},
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.SEARCH_BULK_ACTION_TYPES>>> = [];
        const selectedItemsKeys = Object.keys(selectedItems ?? []);

        if (selectedItemsKeys.length === 0) {
            return null;
        }

        const itemsToDelete = selectedItemsKeys.filter((id) => !selectedItems[id].canDelete);

        if (itemsToDelete.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: 'Delete',
                value: CONST.SEARCH_BULK_ACTION_TYPES.DELETE,
                onSelected: () => {},
            });
        }

        const itemsToHold = selectedItemsKeys.filter((id) => selectedItems[id].action === 'hold');

        if (itemsToHold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: 'Hold',
                value: CONST.SEARCH_BULK_ACTION_TYPES.HOLD,
                onSelected: () => {},
            });
        }

        const itemsToUnhold = selectedItemsKeys.filter((id) => selectedItems[id].action === 'unhold');

        if (itemsToUnhold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: 'Unhold',
                value: CONST.SEARCH_BULK_ACTION_TYPES.UNHOLD,
                onSelected: () => {},
            });
        }

        return (
            <ButtonWithDropdownMenu
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                pressOnEnter
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {selectedNumber: selectedItemsKeys.length})}
                options={options}
                isSplitButton={false}
                isDisabled
            />
        );
    };

    if (isSmallScreenWidth) {
        return null;
    }

    return (
        <HeaderWithBackButton
            title={headerContent[query]?.title}
            icon={headerContent[query]?.icon}
            shouldShowBackButton={false}
        >
            {getHeaderButtons()}
        </HeaderWithBackButton>
    );
}

SearchHeader.displayName = 'SearchHeader';

export default SearchHeader;
