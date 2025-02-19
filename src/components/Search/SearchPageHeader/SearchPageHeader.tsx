import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {useSearchContext} from '@components/Search/SearchContext';
import type {PaymentData, SearchQueryJSON} from '@components/Search/types';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    payMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    updateAdvancedFilters,
} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates, hasVBBA} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import SearchPageHeaderInput from './SearchPageHeaderInput';

type SearchPageHeaderProps = {queryJSON: SearchQueryJSON; searchName?: string; searchRouterListVisible?: boolean; hideSearchRouterList?: () => void; onSearchRouterFocus?: () => void};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({queryJSON, searchName, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus}: SearchPageHeaderProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {activeWorkspaceID} = useActiveWorkspace();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {selectedTransactions, clearSelectedTransactions, selectedReports} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [lastPaymentMethods = {}] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [isDeleteExpensesConfirmModalVisible, setIsDeleteExpensesConfirmModalVisible] = useState(false);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SEARCH_FILTER_BUTTON_TOOLTIP,
        isScreenFocused,
    );

    const {status, hash} = queryJSON;

    useFocusEffect(
        useCallback(() => {
            setIsScreenFocused(true);
            return () => {
                setIsScreenFocused(false);
            };
        }, []),
    );

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const handleDeleteExpenses = () => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        setIsDeleteExpensesConfirmModalVisible(false);
        deleteMoneyRequestOnSearch(hash, selectedTransactionsKeys);

        // Translations copy for delete modal depends on amount of selected items,
        // We need to wait for modal to fully disappear before clearing them to avoid translation flicker between singular vs plural
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    };

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0) {
            return [];
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.action === CONST.SEARCH.ACTION_TYPES.APPROVE)
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.APPROVE));

        if (shouldShowApproveOption) {
            options.push({
                icon: Expensicons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    const reportIDList = !selectedReports.length
                        ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
                        : selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [];
                    approveMoneyRequestOnSearch(hash, reportIDList, transactionIDList);
                },
            });
        }

        const shouldShowPayOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.action === CONST.SEARCH.ACTION_TYPES.PAY && report.policyID && lastPaymentMethods[report.policyID])
                : selectedTransactionsKeys.every(
                      (id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.PAY && selectedTransactions[id].policyID && lastPaymentMethods[selectedTransactions[id].policyID],
                  ));

        if (shouldShowPayOption) {
            options.push({
                icon: Expensicons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const activeRoute = Navigation.getActiveRoute();
                    const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    const items = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

                    for (const item of items) {
                        const policyID = item.policyID;
                        const lastPolicyPaymentMethod = policyID ? lastPaymentMethods?.[policyID] : null;

                        if (!lastPolicyPaymentMethod) {
                            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: item.reportID, backTo: activeRoute}));
                            return;
                        }

                        const hasPolicyVBBA = hasVBBA(policyID);

                        if (lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
                            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: item.reportID, backTo: activeRoute}));
                            return;
                        }
                    }

                    const paymentData = (
                        selectedReports.length
                            ? selectedReports.map((report) => ({reportID: report.reportID, amount: report.total, paymentType: lastPaymentMethods[`${report.policyID}`]}))
                            : Object.values(selectedTransactions).map((transaction) => ({
                                  reportID: transaction.reportID,
                                  amount: transaction.amount,
                                  paymentType: lastPaymentMethods[transaction.policyID],
                              }))
                    ) as PaymentData[];

                    payMoneyRequestOnSearch(hash, paymentData, transactionIDList);
                },
            });
        }

        options.push({
            icon: Expensicons.Download,
            text: translate('common.download'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            onSelected: () => {
                if (isOffline) {
                    setIsOfflineModalVisible(true);
                    return;
                }

                const reportIDList = selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [];
                exportSearchItemsToCSV(
                    {
                        query: status,
                        jsonQuery: JSON.stringify(queryJSON),
                        reportIDList,
                        transactionIDList: selectedTransactionsKeys,
                        policyIDs: activeWorkspaceID ? [activeWorkspaceID] : [''],
                    },
                    () => {
                        setIsDownloadErrorModalVisible(true);
                    },
                );
            },
        });

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
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
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
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
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    setIsDeleteExpensesConfirmModalVisible(true);
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
        isOffline,
        selectedReports,
        translate,
        hash,
        lastPaymentMethods,
        status,
        queryJSON,
        activeWorkspaceID,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
    ]);

    const onFiltersButtonPress = useCallback(() => {
        hideProductTrainingTooltip();
        const filterFormValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
        updateAdvancedFilters(filterFormValues);

        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [allCards, currencyList, hideProductTrainingTooltip, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    const InputRightComponent = useMemo(() => {
        return headerButtonsOptions.length > 0 ? (
            <ButtonWithDropdownMenu
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {count: selectedTransactionsKeys.length})}
                options={headerButtonsOptions}
                isSplitButton={false}
                shouldUseStyleUtilityForAnchorPosition
            />
        ) : (
            <EducationalTooltip
                shouldRender={shouldShowProductTrainingTooltip}
                anchorAlignment={{
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                }}
                shiftHorizontal={variables.searchFiltersTooltipShiftHorizontal}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                renderTooltipContent={renderProductTrainingTooltip}
                onTooltipPress={onFiltersButtonPress}
            >
                <Button
                    innerStyles={[styles.searchAutocompleteInputResults, styles.borderNone, styles.bgTransparent]}
                    icon={Expensicons.Filters}
                    onPress={onFiltersButtonPress}
                />
            </EducationalTooltip>
        );
    }, [
        headerButtonsOptions,
        onFiltersButtonPress,
        renderProductTrainingTooltip,
        selectedTransactionsKeys.length,
        shouldShowProductTrainingTooltip,
        styles.bgTransparent,
        styles.borderNone,
        styles.productTrainingTooltipWrapper,
        styles.searchAutocompleteInputResults,
        translate,
    ]);

    if (shouldUseNarrowLayout && selectionMode?.isEnabled) {
        return (
            <View>
                <SearchSelectedNarrow
                    options={headerButtonsOptions}
                    itemsLength={selectedTransactionsKeys.length}
                />
                <ConfirmModal
                    isVisible={isDeleteExpensesConfirmModalVisible}
                    onConfirm={handleDeleteExpenses}
                    onCancel={() => {
                        setIsDeleteExpensesConfirmModalVisible(false);
                    }}
                    title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                    prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <DecisionModal
                    title={translate('common.youAppearToBeOffline')}
                    prompt={translate('common.offlinePrompt')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={isOfflineModalVisible}
                    onClose={() => setIsOfflineModalVisible(false)}
                />
                <DecisionModal
                    title={translate('common.downloadFailedTitle')}
                    prompt={translate('common.downloadFailedDescription')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={isDownloadErrorModalVisible}
                    onClose={() => setIsDownloadErrorModalVisible(false)}
                />
            </View>
        );
    }

    return (
        <>
            <SearchPageHeaderInput
                searchRouterListVisible={searchRouterListVisible}
                onSearchRouterFocus={onSearchRouterFocus}
                queryJSON={queryJSON}
                searchName={searchName}
                hideSearchRouterList={hideSearchRouterList}
                inputRightComponent={InputRightComponent}
            />
            <ConfirmModal
                isVisible={isDeleteExpensesConfirmModalVisible}
                onConfirm={handleDeleteExpenses}
                onCancel={() => {
                    setIsDeleteExpensesConfirmModalVisible(false);
                }}
                title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isOfflineModalVisible}
                onClose={() => setIsOfflineModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
        </>
    );
}

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
