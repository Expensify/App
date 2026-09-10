import AddExistingExpenseFooter from '@components/AddExistingExpenseFooter';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import UnreportedExpensesSkeleton from '@components/Skeletons/UnreportedExpensesSkeleton';
import type {UnreportedExpenseTableRowData} from '@components/Tables/AddExistingExpenseTable';
import AddExistingExpenseTable from '@components/Tables/AddExistingExpenseTable';

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
import {createUnreportedExpenses, getEligibleTransactionsToAdd} from '@libs/TransactionUtils';

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

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

type AddExistingExpensePageType = PlatformStackScreenProps<AddExistingExpensesParamList, typeof SCREENS.ADD_EXISTING_EXPENSES_ROOT>;

function AddExistingExpense({route}: AddExistingExpensePageType) {
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
                <AddExistingExpenseTable
                    data={unreportedExpenses}
                    selectedKeys={[...selectedIds]}
                    onRowSelectionChange={onRowSelectionChange}
                    onEndReached={fetchMoreUnreportedTransactions}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={paginationFooterContent}
                />
            </View>
            {footerContent}
        </ScreenWrapper>
    );
}

export default AddExistingExpense;
