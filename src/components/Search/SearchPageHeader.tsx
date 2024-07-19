import React, {useMemo} from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchQuery, SearchReport} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';
import getDownloadOption from './SearchActionOptionsUtils';
import {useSearchContext} from './SearchContext';
import type {SelectedTransactions} from './types';

type SearchPageHeaderProps = {
    query: SearchQuery;
    selectedTransactions?: SelectedTransactions;
    selectedReports?: Array<SearchReport['reportID']>;
    clearSelectedItems?: () => void;
    hash: number;
    onSelectDeleteOption?: (itemsToDelete: string[]) => void;
    isMobileSelectionModeActive?: boolean;
    setIsMobileSelectionModeActive?: (isMobileSelectionModeActive: boolean) => void;
    setOfflineModalOpen?: () => void;
    setDownloadErrorModalOpen?: () => void;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({
    query,
    selectedTransactions = {},
    hash,
    clearSelectedItems,
    onSelectDeleteOption,
    isMobileSelectionModeActive,
    setIsMobileSelectionModeActive,
    setOfflineModalOpen,
    setDownloadErrorModalOpen,
    selectedReports,
}: SearchPageHeaderProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {setSelectedTransactionIDs} = useSearchContext();

    const headerContent: {[key in SearchQuery]: {icon: IconAsset; title: string}} = {
        all: {icon: Illustrations.MoneyReceipts, title: translate('common.expenses')},
        shared: {icon: Illustrations.SendMoney, title: translate('common.shared')},
        drafts: {icon: Illustrations.Pencil, title: translate('common.drafts')},
        finished: {icon: Illustrations.CheckmarkCircle, title: translate('common.finished')},
    };

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? []);

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0) {
            return [];
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];

        // Because of some problems with the lib we use for download on native we are only enabling download for web, we should remove the SearchActionOptionsUtils files when https://github.com/Expensify/App/issues/45511 is done
        const downloadOption = getDownloadOption(translate('common.download'), () => {
            if (isOffline) {
                setOfflineModalOpen?.();
                return;
            }

            SearchActions.exportSearchItemsToCSV(query, selectedReports, selectedTransactionsKeys, [activeWorkspaceID ?? ''], () => {
                setDownloadErrorModalOpen?.();
            });
        });

        if (downloadOption) {
            options.push(downloadOption);
        }

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    clearSelectedItems?.();
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
                    setSelectedTransactionIDs(selectedTransactionsKeys);
                    Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP.getRoute(query));
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    clearSelectedItems?.();
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
                    SearchActions.unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                },
            });
        }

        const shouldShowDeleteOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canDelete);

        if (shouldShowDeleteOption) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    onSelectDeleteOption?.(selectedTransactionsKeys);
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
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal, ...styles.textWrap},
            };

            options.push({
                icon: Expensicons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        selectedTransactionsKeys,
        selectedTransactions,
        translate,
        onSelectDeleteOption,
        clearSelectedItems,
        isMobileSelectionModeActive,
        hash,
        setIsMobileSelectionModeActive,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        query,
        isOffline,
        setOfflineModalOpen,
        setDownloadErrorModalOpen,
        activeWorkspaceID,
        selectedReports,
        styles.textWrap,
        setSelectedTransactionIDs,
    ]);

    if (isSmallScreenWidth) {
        if (isMobileSelectionModeActive) {
            return (
                <SearchSelectedNarrow
                    options={headerButtonsOptions}
                    itemsLength={selectedTransactionsKeys.length}
                />
            );
        }
        return null;
    }

    return (
        <HeaderWithBackButton
            title={headerContent[query]?.title}
            icon={headerContent[query]?.icon}
            shouldShowBackButton={false}
        >
            {headerButtonsOptions.length > 0 && (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedTransactionsKeys.length})}
                    options={headerButtonsOptions}
                    isSplitButton={false}
                />
            )}
        </HeaderWithBackButton>
    );
}

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
