import AddExistingExpenseFooter from '@components/AddExistingExpenseFooter';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import UnreportedExpensesSkeleton from '@components/Skeletons/UnreportedExpensesSkeleton';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {createUnreportedExpenses, getAmount, getCreated, getCurrency, getDescription, getEligibleTransactionsToAdd, getMerchant, isUnreportedTransaction} from '@libs/TransactionUtils';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';

import {startMoneyRequest} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {openExpenseReportIDsSelector} from '@src/selectors/Report';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {OnyxCollection} from 'react-native-onyx';

import {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import AddExistingExpenseTableRow from './AddExistingExpenseTableRow';

type AddExistingExpensePageType = PlatformStackScreenProps<AddExistingExpensesParamList, typeof SCREENS.ADD_EXISTING_EXPENSES_ROOT>;
type ExpenseTableColumnKey = 'date' | 'amount';
type ExpenseTableFilterKey = 'status';
type UnreportedExpenseTableRowData = Transaction & TableData;

function AddExistingExpense({route}: AddExistingExpensePageType) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapersAndWatch']);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [offset, setOffset] = useState(0);
    const {isOffline} = useNetwork();
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const {reportID, backToReport} = route.params;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportToConfirm] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID}`);
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
    const styles = useThemeStyles();

    const transactionsSelector = useCallback(
        (allTransactions: OnyxCollection<Transaction>) =>
            getEligibleTransactionsToAdd({transactions: allTransactions, report, policy, cardList, currentUserAccountID, reportID, allOpenReports, openReportDrafts}),
        [report, policy, cardList, currentUserAccountID, reportID, allOpenReports, openReportDrafts],
    );
    const [transactions = getEmptyArray<Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: transactionsSelector});

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

    const unreportedExpenses: UnreportedExpenseTableRowData[] = createUnreportedExpenses(transactions).map((item) => ({
        ...item,
        disabled: item.isDisabled,
    }));

    const footerContent = (
        <AddExistingExpenseFooter
            selectedIds={selectedIds}
            report={report}
            reportToConfirm={reportToConfirm}
            policy={policy}
            policyCategories={policyCategories}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
        />
    );

    const onRowSelectionChange = (selectedRowKeys: string[]) => {
        setSelectedIds(new Set(selectedRowKeys));
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    const columns: Array<TableColumn<ExpenseTableColumnKey>> = [
        {key: 'date', label: translate('common.date'), sortable: true},
        {key: 'amount', label: translate('iou.amount'), sortable: true},
    ];

    const filters: FilterConfig<ExpenseTableFilterKey> = {
        status: {
            label: translate('common.status'),
            filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
            options: [
                {label: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
                {label: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
            ],
        },
    };

    const isItemInFilter: IsItemInFilterCallback<UnreportedExpenseTableRowData> = (item, values) => {
        if (values.length === 0) {
            return true;
        }

        const includesUnreported = values.includes(CONST.SEARCH.STATUS.EXPENSE.UNREPORTED);
        const includesDrafts = values.includes(CONST.SEARCH.STATUS.EXPENSE.DRAFTS);
        const isUnreported = isUnreportedTransaction(item);

        if (includesUnreported && isUnreported) {
            return true;
        }
        return includesDrafts && !isUnreported;
    };

    const isItemInSearch: IsItemInSearchCallback<UnreportedExpenseTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (transaction) => {
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

        return results.length > 0;
    };

    const compareItems: CompareItemsCallback<UnreportedExpenseTableRowData, ExpenseTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'desc' ? -1 : 1;

        if (activeSorting.columnKey === 'amount') {
            return (getAmount(item1) - getAmount(item2)) * orderMultiplier;
        }

        // Default: sort by the expense date, matching how Spend > Expenses orders rows by default.
        const created1 = new Date(getCreated(item1)).getTime();
        const created2 = new Date(getCreated(item2)).getTime();
        return (created1 - created2) * orderMultiplier;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<UnreportedExpenseTableRowData>) => (
        <AddExistingExpenseTableRow
            item={item}
            rowIndex={index}
        />
    );

    const paginationFooterContent = shouldShowUnreportedTransactionsSkeletons ? <UnreportedExpensesSkeleton fixedNumberOfItems={3} /> : undefined;

    const isShowingEmptyState = transactions.length === 0;

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
                <UnreportedExpensesSkeleton />
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
                                    if (
                                        report?.policyID &&
                                        shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)
                                    ) {
                                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(report.policyID));
                                        return;
                                    }
                                    interceptAnonymousUser(() => {
                                        startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID, draftTransactionIDs, undefined, false, backToReport);
                                    });
                                },
                                buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
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
            <View style={styles.flex1}>
                <Table<UnreportedExpenseTableRowData, ExpenseTableColumnKey, ExpenseTableFilterKey>
                    data={unreportedExpenses}
                    title={translate('common.expenses')}
                    columns={columns}
                    selectionEnabled
                    shouldEnableSelectionInNarrowPaneModal
                    selectedKeys={[...selectedIds]}
                    onRowSelectionChange={onRowSelectionChange}
                    initialSortColumn="date"
                    initialSortOrder="desc"
                    compareItems={compareItems}
                    filters={filters}
                    isItemInFilter={isItemInFilter}
                    isItemInSearch={isItemInSearch}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.keyForList}
                    onEndReached={fetchMoreUnreportedTransactions}
                    onEndReachedThreshold={0.75}
                    maintainVisibleContentPosition={{disabled: true}}
                    ListFooterComponent={paginationFooterContent}
                >
                    <Table.ListHeader>
                        <Table.FilterBar label={translate('iou.findExpense')} />
                    </Table.ListHeader>
                    <Table.NoResultsState />
                    <Table.Header />
                    <Table.Body />
                </Table>
            </View>
            {footerContent}
        </ScreenWrapper>
    );
}

export default AddExistingExpense;
export type {UnreportedExpenseTableRowData};
