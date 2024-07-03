import React, {useCallback} from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SelectedTransactions} from './types';

type SearchHeaderProps = {
    query: SearchQuery;
    selectedItems?: SelectedTransactions;
    clearSelectedItems?: () => void;
    hash: number;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({query, selectedItems = {}, hash, clearSelectedItems}: SearchHeaderProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const headerContent: {[key in SearchQuery]: {icon: IconAsset; title: string}} = {
        all: {icon: Illustrations.MoneyReceipts, title: translate('common.expenses')},
        shared: {icon: Illustrations.SendMoney, title: translate('common.shared')},
        drafts: {icon: Illustrations.Pencil, title: translate('common.drafts')},
        finished: {icon: Illustrations.CheckmarkCircle, title: translate('common.finished')},
    };

    const getHeaderButtons = useCallback(() => {
        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const selectedItemsKeys = Object.keys(selectedItems ?? []);

        if (selectedItemsKeys.length === 0) {
            return null;
        }

        const itemsToDelete = selectedItemsKeys.filter((id) => selectedItems[id].canDelete);

        if (itemsToDelete.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                onSelected: () => {
                    clearSelectedItems?.();
                    SearchActions.deleteMoneyRequestOnSearch(hash, itemsToDelete);
                },
            });
        }

        const itemsToHold = selectedItemsKeys.filter((id) => selectedItems[id].action === CONST.SEARCH.BULK_ACTION_TYPES.HOLD);

        if (itemsToHold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                onSelected: () => {
                    clearSelectedItems?.();
                    SearchActions.holdMoneyRequestOnSearch(hash, itemsToHold, '');
                },
            });
        }

        const itemsToUnhold = selectedItemsKeys.filter((id) => selectedItems[id].action === CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD);

        if (itemsToUnhold.length > 0) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                onSelected: () => {
                    clearSelectedItems?.();
                    SearchActions.unholdMoneyRequestOnSearch(hash, itemsToUnhold);
                },
            });
        }

        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables.iconSizeLarge,
                iconWidth: variables.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal},
            };

            options.push({
                icon: Expensicons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
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
                isDisabled={isOffline}
            />
        );
    }, [clearSelectedItems, hash, isOffline, selectedItems, styles.colorMuted, styles.fontWeightNormal, theme.icon, translate]);

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

SearchPageHeader.displayName = 'SearchPageHeader';

export default SearchPageHeader;
