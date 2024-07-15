import React, {useMemo} from 'react';
import Button from '@components/Button';
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
import * as SearchUtils from '@libs/SearchUtils';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
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
    isMobileSelectionModeActive?: boolean;
    setIsMobileSelectionModeActive?: (isMobileSelectionModeActive: boolean) => void;
    isSearchResultsMode?: boolean;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({
    query,
    selectedItems = {},
    hash,
    clearSelectedItems,
    isMobileSelectionModeActive,
    setIsMobileSelectionModeActive,
    isSearchResultsMode = false,
}: SearchHeaderProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const headerContent: {[key in SearchQuery]: {icon: IconAsset; title: string}} = useMemo(
        () => ({
            all: {icon: Illustrations.MoneyReceipts, title: translate('common.expenses')},
            shared: {icon: Illustrations.SendMoney, title: translate('common.shared')},
            drafts: {icon: Illustrations.Pencil, title: translate('common.drafts')},
            finished: {icon: Illustrations.CheckmarkCircle, title: translate('common.finished')},
        }),
        [translate],
    );

    const subtitle = useMemo(() => {
        if (!isSearchResultsMode) {
            return '';
        }

        return 'Filters';
    }, [isSearchResultsMode]);

    const headerTitle = useMemo(() => {
        if (isSearchResultsMode) {
            return SearchUtils.getSearchHeaderTitle(query, false);
        }

        return headerContent[query]?.title;
    }, [headerContent, isSearchResultsMode, query]);

    const headerIcon = useMemo(() => {
        if (isSearchResultsMode) {
            return Illustrations.Filters;
        }

        return headerContent[query]?.icon;
    }, [headerContent, isSearchResultsMode, query]);

    const selectedItemsKeys = Object.keys(selectedItems ?? []);

    const headerButtonsOptions = useMemo(() => {
        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];

        if (selectedItemsKeys.length === 0) {
            return options;
        }

        const itemsToDelete = selectedItemsKeys.filter((id) => selectedItems[id].canDelete);

        if (itemsToDelete.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                onSelected: () => {
                    clearSelectedItems?.();
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
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
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
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
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
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

        return options;
    }, [clearSelectedItems, hash, selectedItems, selectedItemsKeys, styles, theme, translate, isMobileSelectionModeActive, setIsMobileSelectionModeActive]);

    if (isSmallScreenWidth) {
        if (isMobileSelectionModeActive) {
            return (
                <SearchSelectedNarrow
                    options={headerButtonsOptions}
                    itemsLength={selectedItemsKeys.length}
                />
            );
        }
        return null;
    }

    return (
        <HeaderWithBackButton
            title={headerTitle}
            icon={headerIcon}
            shouldShowBackButton={false}
            showSubtitleAboveTitle={isSearchResultsMode}
            subtitle={subtitle}
        >
            {isSearchResultsMode && (
                <Button
                    icon={Expensicons.Filters}
                    text="Filters"
                    medium
                />
            )}

            {headerButtonsOptions.length > 0 && (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedItemsKeys.length})}
                    options={headerButtonsOptions}
                    isSplitButton={false}
                    isDisabled={isOffline}
                    style={styles.ml2}
                />
            )}
        </HeaderWithBackButton>
    );
}

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
