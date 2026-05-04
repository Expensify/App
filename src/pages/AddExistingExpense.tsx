import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import AddExistingExpenseFooter from '@components/AddExistingExpenseFooter';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SelectionList from '@components/SelectionList';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import UnreportedExpensesSkeleton from '@components/Skeletons/UnreportedExpensesSkeleton';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {fetchUnreportedExpenses} from '@libs/actions/UnreportedExpenses';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import type {AddExistingExpensesParamList} from '@libs/Navigation/types';
import {canSubmitPerDiemExpenseFromWorkspace, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {getTransactionDetails, isIOUReport} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import tokenizedSearch from '@libs/tokenizedSearch';
import {createUnreportedExpenses, getAmount, getCurrency, getDescription, getMerchant, isPerDiemRequest} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {startMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {openExpenseReportIDsSelector} from '@src/selectors/Report';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import UnreportedExpenseListItem from './UnreportedExpenseListItem';

type AddExistingExpensePageType = PlatformStackScreenProps<AddExistingExpensesParamList, typeof SCREENS.ADD_EXISTING_EXPENSES_ROOT>;
type ExpenseStatus = typeof CONST.SEARCH.STATUS.EXPENSE.UNREPORTED | typeof CONST.SEARCH.STATUS.EXPENSE.DRAFTS;

function isUnreportedTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || transaction?.reportID === '';
}

function AddExistingExpense({route}: AddExistingExpensePageType) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapersAndWatch']);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [offset, setOffset] = useState(0);
    const {isOffline} = useNetwork();
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const [selectedStatuses, setSelectedStatuses] = useState<Array<MultiSelectItem<ExpenseStatus>>>([]);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {reportID, backToReport} = route.params;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportToConfirm] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID}`);
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [hasMoreUnreportedTransactionsResults] = useOnyx(ONYXKEYS.HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS);
    const [isLoadingUnreportedTransactions] = useOnyx(ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const shouldShowUnreportedTransactionsSkeletons = isLoadingUnreportedTransactions && hasMoreUnreportedTransactionsResults && !isOffline;
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [allOpenReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: openExpenseReportIDsSelector});
    const [openReportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {selector: openExpenseReportIDsSelector});
    const isInLandscapeMode = useIsInLandscapeMode();
    const initialSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'AddExistingExpense.InitialSkeleton',
        isLoadingUnreportedTransactions,
    };

    const paginationSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'AddExistingExpense.PaginationSkeleton',
        isLoadingUnreportedTransactions,
        hasMoreUnreportedTransactionsResults,
        isOffline,
    };

    const getEligibleTransactions = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            if (!transactions) {
                return [];
            }
            const isIOU = isIOUReport(report);
            return Object.values(transactions || {}).filter((item) => {
                const isUnreported = isUnreportedTransaction(item);
                if (isIOU && !isUnreported) {
                    return false;
                }

                const isOnOpenExpenseReport = !!(item?.reportID && (allOpenReports?.[item.reportID] ?? openReportDrafts?.[item.reportID]));
                if (!isUnreported && !isOnOpenExpenseReport) {
                    return false;
                }

                // Don't show expenses that are already on the current report
                if (item?.reportID === reportID) {
                    return false;
                }

                // Check if the transaction belongs to the current user by verifying card ownership
                if (item?.cardID) {
                    const card = cardList?.[item.cardID];
                    if (card?.accountID !== currentUserAccountID) {
                        return false;
                    }
                }

                const transactionAmount = getTransactionDetails(item)?.amount ?? 0;

                // Only block negative amounts for unreported expenses.
                if (transactionAmount < 0 && isUnreported) {
                    return false;
                }

                // Zero amount expenses are not allowed in IOU reports
                if (isIOU && transactionAmount === 0) {
                    return false;
                }

                if (isPerDiemRequest(item)) {
                    // Only show per diem expenses if the target workspace has per diem enabled and the per diem expense was created in the same workspace
                    const workspacePerDiemUnit = getPerDiemCustomUnit(policy);
                    const perDiemCustomUnitID = item?.comment?.customUnit?.customUnitID;

                    return canSubmitPerDiemExpenseFromWorkspace(policy) && (!perDiemCustomUnitID || perDiemCustomUnitID === workspacePerDiemUnit?.customUnitID);
                }

                return true;
            });
        },
        [policy, report, cardList, currentUserAccountID, reportID, allOpenReports, openReportDrafts],
    );

    const [transactions = getEmptyArray<Transaction>()] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: getEligibleTransactions,
        },
        [getEligibleTransactions],
    );

    const fetchMoreUnreportedTransactions = () => {
        if (!hasMoreUnreportedTransactionsResults || isLoadingUnreportedTransactions) {
            return;
        }
        fetchUnreportedExpenses(offset + CONST.UNREPORTED_EXPENSES_PAGE_SIZE);
        setOffset((prevOffset) => prevOffset + CONST.UNREPORTED_EXPENSES_PAGE_SIZE);
    };

    useEffect(() => {
        fetchUnreportedExpenses(0);
    }, []);

    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle<Transaction & ListItem>>(null);

    const shouldShowTextInput = useMemo(() => {
        return transactions.length >= CONST.SEARCH_ITEM_LIMIT;
    }, [transactions.length]);

    const filteredTransactions = useMemo(() => {
        if (!debouncedSearchValue.trim() || !shouldShowTextInput) {
            return transactions;
        }

        return tokenizedSearch(transactions, debouncedSearchValue, (transaction) => {
            const searchableFields: string[] = [];

            const merchant = getMerchant(transaction);
            if (merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT) {
                searchableFields.push(merchant);
            }

            const description = getDescription(transaction);
            if (description.trim()) {
                searchableFields.push(description);
            }

            const amount = getAmount(transaction);
            const currency = getCurrency(transaction);
            const formattedAmount = convertToDisplayString(amount, currency);
            searchableFields.push(formattedAmount);

            // This allows users to search "2000" and find "$2,000.00" for example
            const normalizedAmount = (amount / 100).toString();
            searchableFields.push(normalizedAmount);

            return searchableFields;
        });
    }, [convertToDisplayString, debouncedSearchValue, shouldShowTextInput, transactions]);

    const selectedStatusValues = useMemo(() => selectedStatuses.map((s) => s.value), [selectedStatuses]);

    const statusFilteredTransactions = useMemo(() => {
        if (selectedStatusValues.length === 0) {
            return filteredTransactions;
        }

        const includesUnreported = selectedStatusValues.includes(CONST.SEARCH.STATUS.EXPENSE.UNREPORTED);
        const includesDrafts = selectedStatusValues.includes(CONST.SEARCH.STATUS.EXPENSE.DRAFTS);

        return filteredTransactions.filter((item) => {
            const isUnreported = isUnreportedTransaction(item);
            if (includesUnreported && isUnreported) {
                return true;
            }
            if (includesDrafts && !isUnreported) {
                return true;
            }
            return false;
        });
    }, [filteredTransactions, selectedStatusValues]);

    const unreportedExpenses = useMemo(() => {
        return createUnreportedExpenses(statusFilteredTransactions).map((item) => ({
            ...item,
            isSelected: selectedIds.has(item.transactionID),
        }));
    }, [statusFilteredTransactions, selectedIds]);

    const footerContent = useMemo(
        () => (
            <AddExistingExpenseFooter
                selectedIds={selectedIds}
                report={report}
                reportToConfirm={reportToConfirm}
                reportNextStep={reportNextStep}
                policy={policy}
                policyCategories={policyCategories}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
            />
        ),
        [selectedIds, report, reportToConfirm, reportNextStep, policy, policyCategories, errorMessage, setErrorMessage],
    );

    const headerMessage = useMemo(() => {
        if ((debouncedSearchValue.trim() || selectedStatusValues.length > 0) && unreportedExpenses?.length === 0) {
            return translate('common.noResultsFound');
        }
        return '';
    }, [debouncedSearchValue, unreportedExpenses?.length, translate, selectedStatusValues.length]);

    const textInputOptions = useMemo(
        () => ({
            value: searchValue,
            label: shouldShowTextInput ? translate('iou.findExpense') : undefined,
            onChangeText: setSearchValue,
        }),
        [searchValue, shouldShowTextInput, translate, setSearchValue],
    );

    const onSelectRow = useCallback(
        (item: {transactionID: string}) => {
            setSelectedIds((prevIds) => {
                const newIds = new Set(prevIds);
                if (newIds.has(item.transactionID)) {
                    newIds.delete(item.transactionID);
                } else {
                    newIds.add(item.transactionID);
                    if (errorMessage) {
                        setErrorMessage('');
                    }
                }
                return newIds;
            });
        },
        [errorMessage],
    );

    const onSelectAll = () => {
        setSelectedIds((prevSelectedIDs) => {
            const availableUnreportedExpenses = unreportedExpenses.filter(({isDisabled}) => !isDisabled);
            if (availableUnreportedExpenses.some(({transactionID}) => prevSelectedIDs.has(transactionID))) {
                return new Set();
            }
            if (errorMessage) {
                setErrorMessage('');
            }
            return new Set(availableUnreportedExpenses.map(({transactionID}) => transactionID));
        });
    };

    const statusItems: Array<MultiSelectItem<ExpenseStatus>> = useMemo(
        () => [
            {text: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
            {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        ],
        [translate],
    );

    const statusPopoverComponent = useCallback(
        (props: {closeOverlay: () => void}) => (
            <MultiSelectPopup
                label={translate('common.status')}
                items={statusItems}
                value={selectedStatuses}
                closeOverlay={props.closeOverlay}
                onChange={setSelectedStatuses}
            />
        ),
        [translate, statusItems, selectedStatuses],
    );

    const customListHeader = useMemo(
        () => (
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <PressableWithFeedback
                    style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter]}
                    onPress={onSelectAll}
                    accessibilityLabel={translate('accessibilityHints.selectAllItems')}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.LIST_HEADER_SELECT_ALL}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                </PressableWithFeedback>
                <DropdownButton
                    label={translate('common.status')}
                    value={selectedStatuses.map((s) => s.text)}
                    PopoverComponent={statusPopoverComponent}
                />
            </View>
        ),
        [
            styles.flex1,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.justifyContentBetween,
            styles.userSelectNone,
            styles.textStrong,
            styles.ph3,
            onSelectAll,
            translate,
            selectedStatuses,
            statusPopoverComponent,
        ],
    );

    const listFooterContent = useMemo(() => {
        if (shouldShowUnreportedTransactionsSkeletons) {
            return (
                <UnreportedExpensesSkeleton
                    fixedNumberOfItems={3}
                    reasonAttributes={paginationSkeletonReasonAttributes}
                />
            );
        }
        if (headerMessage) {
            return (
                <View style={[styles.ph5, styles.pt3]}>
                    <Text style={[styles.textLabel, styles.colorMuted]}>{headerMessage}</Text>
                </View>
            );
        }
        return undefined;
    }, [shouldShowUnreportedTransactionsSkeletons, headerMessage, paginationSkeletonReasonAttributes, styles.ph5, styles.pt3, styles.textLabel, styles.colorMuted]);

    const hasSearchTerm = debouncedSearchValue.trim().length > 0;
    const isShowingEmptyState = !hasSearchTerm && transactions.length === 0;

    if (isShowingEmptyState && isLoadingUnreportedTransactions) {
        return (
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                includeSafeAreaPaddingBottom
                shouldShowOfflineIndicator={false}
                shouldEnablePickerAvoiding={false}
                testID="NewChatSelectorPage"
                focusTrapSettings={{active: false}}
            >
                <HeaderWithBackButton
                    title={translate('iou.addExistingExpense')}
                    onBackButtonPress={Navigation.goBack}
                />
                <UnreportedExpensesSkeleton reasonAttributes={initialSkeletonReasonAttributes} />
            </ScreenWrapper>
        );
    }

    if (isShowingEmptyState) {
        return (
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                includeSafeAreaPaddingBottom
                shouldEnablePickerAvoiding={false}
                testID="NewChatSelectorPage"
                focusTrapSettings={{active: false}}
            >
                <HeaderWithBackButton
                    title={translate('iou.addExistingExpense')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <EmptyStateComponent
                        minModalHeight={isInLandscapeMode ? 0 : undefined}
                        cardStyles={[styles.appBG]}
                        cardContentStyles={[styles.pb0]}
                        headerMedia={illustrations.FolderWithPapersAndWatch}
                        title={translate('iou.emptyStateExistingExpenseTitle')}
                        subtitle={translate('iou.emptyStateExistingExpenseSubtitle')}
                        headerStyles={[styles.emptyStateMoneyRequestReport]}
                        headerContentStyles={[styles.emptyStateFolderStaticIllustration]}
                        buttons={[
                            {
                                buttonText: translate('iou.createExpense'),
                                buttonAction: () => {
                                    if (report?.policyID && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
                                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(report.policyID));
                                        return;
                                    }
                                    interceptAnonymousUser(() => {
                                        startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID, draftTransactionIDs, undefined, false, backToReport);
                                    });
                                },
                                success: true,
                            },
                        ]}
                    />
                </ScrollView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="NewChatSelectorPage"
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title={translate('iou.addExistingExpense')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList<Transaction & ListItem>
                data={unreportedExpenses}
                ref={selectionListRef}
                onSelectRow={onSelectRow}
                onSelectAll={onSelectAll}
                customListHeader={customListHeader}
                style={{listHeaderWrapperStyle: styles.ph8}}
                textInputOptions={textInputOptions}
                shouldShowTextInput={shouldShowTextInput}
                shouldShowListEmptyContent={false}
                canSelectMultiple
                ListItem={UnreportedExpenseListItem}
                onEndReached={fetchMoreUnreportedTransactions}
                onEndReachedThreshold={0.75}
                addBottomSafeAreaPadding
                listFooterContent={listFooterContent}
                footerContent={footerContent}
                disableMaintainingScrollPosition
            />
        </ScreenWrapper>
    );
}

export default AddExistingExpense;
