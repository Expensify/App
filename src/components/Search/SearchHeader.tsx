import React from 'react';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import CONST from '@src/CONST';
import type {SearchQuery, SelectedTransactions} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchHeaderProps = {
    query: SearchQuery;
    selectedItems: SelectedTransactions;
    hash: number;
};

function SearchHeader({query, selectedItems, hash}: SearchHeaderProps) {
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

        const itemsToDelete = selectedItemsKeys.filter((id) => selectedItems[id].canDelete);

        if (itemsToDelete.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: 'Delete',
                value: CONST.SEARCH_BULK_ACTION_TYPES.DELETE,
                onSelected: () => {
                    SearchActions.deleteMoneyRequestOnSearch(hash, itemsToDelete);
                },
            });
        }

        const itemsToHold = selectedItemsKeys.filter((id) => selectedItems[id].action === CONST.SEARCH_BULK_ACTION_TYPES.HOLD);

        if (itemsToHold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: 'Hold',
                value: CONST.SEARCH_BULK_ACTION_TYPES.HOLD,
                onSelected: () => {
                    SearchActions.holdMoneyRequestOnSearch(hash, itemsToHold, '');
                },
            });
        }

        const itemsToUnhold = selectedItemsKeys.filter((id) => selectedItems[id].action === CONST.SEARCH_BULK_ACTION_TYPES.UNHOLD);

        if (itemsToUnhold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: 'Unhold',
                value: CONST.SEARCH_BULK_ACTION_TYPES.UNHOLD,
                onSelected: () => {
                    SearchActions.unholdMoneyRequestOnSearch(hash, itemsToUnhold);
                },
            });
        }

        if (options.length > 0) {
            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedItemsKeys.length})}
                    options={options}
                    isSplitButton={false}
                />
            );
        }

        return (
            <Button
                medium
                text={translate('workspace.common.selected', {selectedNumber: selectedItemsKeys.length})}
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
