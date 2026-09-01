import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDistanceExpenseTypeForPolicy} from '@libs/PolicyDistanceRatesUtils';
import {isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {
    canAddTransaction,
    getAddExpenseDropdownOptions,
    getBillableAndTaxTotal,
    getMoneyRequestSpendBreakdown,
    getReportOfflinePendingActionAndErrors,
    isCurrentUserSubmitter,
} from '@libs/ReportUtils';
import {hasNonReimbursableTransactions} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React from 'react';
import {View} from 'react-native';

import MoneyRequestReportTotalSpend from './MoneyRequestReportTotalSpend';

type MoneyRequestReportListFooterProps = {
    /** The money request report containing the transactions */
    report: StableReport;

    /** The workspace to which the report belongs */
    policy: OnyxTypes.Policy | undefined;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Whether any of the report's transactions has a pending action */
    hasPendingAction: boolean;

    /** Whether the pending-expense skeleton row shows above the footer */
    showPendingExpensePlaceholder: boolean;
};

/**
 * Everything the money-request report view renders below the transaction rows: the pending-expense
 * skeleton, the Add Expense button, the spend breakdown, and the report total.
 */
function MoneyRequestReportListFooter({report, policy, transactions, hasPendingAction, showPendingExpensePlaceholder}: MoneyRequestReportListFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'ReceiptPlus', 'Plus']);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const distanceExpenseType = getDistanceExpenseTypeForPolicy(policy, lastDistanceExpenseType);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: policy?.id,
        isDistanceRequest: true,
    });
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);
    const isTaxEnabled = isPolicyTaxEnabled(policy);
    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const {billableTotal, taxTotal} = getBillableAndTaxTotal(report, transactions);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const formattedBillableAmount = convertToDisplayString(billableTotal, report?.currency);
    const formattedTaxAmount = convertToDisplayString(taxTotal, report?.currency);
    const shouldShowExpenseReportBreakDown = hasNonReimbursableTransactions(transactions);
    const shouldShowBreakdown = shouldShowExpenseReportBreakDown || !!billableTotal || (!!taxTotal && isTaxEnabled);
    const shouldShowAddExpenseButton = canAddTransaction(report, isReportArchived) && isCurrentUserSubmitter(report);

    const addExpenseDropdownOptions = getAddExpenseDropdownOptions({
        translate,
        icons: expensifyIcons,
        iouReportID: report?.reportID,
        policy,
        userBillingGracePeriodEnds,
        draftTransactionIDs,
        amountOwed,
        ownerBillingGracePeriodEnd,
        lastDistanceExpenseType: distanceExpenseType,
        currentUserAccountID: currentUserDetails?.accountID,
        blockDistanceRequestIfNeeded,
    });

    return (
        <View style={[shouldUseNarrowLayout ? styles.pb2 : styles.pb4]}>
            {showPendingExpensePlaceholder && (
                <View style={styles.ph5}>
                    <SearchRowSkeleton
                        shouldAnimate
                        fixedNumItems={1}
                        isLoadMore
                        containerStyle={styles.mhn5}
                        shouldUseNarrowLayout={false}
                    />
                </View>
            )}
            <View
                style={[
                    styles.dFlex,
                    styles.flexRow,
                    shouldShowAddExpenseButton ? styles.justifyContentBetween : styles.justifyContentEnd,
                    styles.gap6,
                    styles.ph5,
                    styles.mv2,
                    styles.alignItemsStart,
                    styles.minHeight7,
                    shouldUseNarrowLayout && styles.flexColumn,
                ]}
            >
                {shouldShowAddExpenseButton && (
                    <OfflineWithFeedback pendingAction={reportPendingAction}>
                        <ButtonWithDropdownMenu
                            onPress={() => {}}
                            shouldAlwaysShowDropdownMenu
                            customText={translate('iou.addExpense')}
                            options={addExpenseDropdownOptions}
                            isSplitButton={false}
                            size={CONST.BUTTON_SIZE.SMALL}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                        />
                    </OfflineWithFeedback>
                )}
                <View style={[styles.flexShrink1, shouldUseNarrowLayout && styles.w100]}>
                    {shouldShowBreakdown && (
                        <View style={[styles.dFlex, styles.alignItemsEnd, styles.gap2, styles.mb2, styles.flex1]}>
                            {[
                                {text: 'cardTransactions.outOfPocket', value: formattedOutOfPocketAmount, shouldShow: !!nonReimbursableSpend},
                                {text: 'cardTransactions.companySpend', value: formattedCompanySpendAmount, shouldShow: !!nonReimbursableSpend},
                                {text: 'common.billable', value: formattedBillableAmount, shouldShow: !!billableTotal},
                                {text: 'common.tax', value: formattedTaxAmount, shouldShow: !!taxTotal && isTaxEnabled},
                            ]
                                .filter(({shouldShow}) => shouldShow)
                                .map(({text, value}) => (
                                    <View
                                        key={text}
                                        style={[
                                            styles.dFlex,
                                            styles.flexRow,
                                            styles.alignItemsCenter,
                                            styles.pr3,
                                            styles.mw100,
                                            shouldUseNarrowLayout && [styles.justifyContentBetween, styles.w100],
                                        ]}
                                    >
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mr3, hasPendingAction && styles.opacitySemiTransparent]}
                                            numberOfLines={1}
                                        >
                                            {translate(text as TranslationPaths)}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.textLabelSupporting,
                                                styles.textNormal,
                                                shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p,
                                                styles.textAlignRight,
                                                hasPendingAction && styles.opacitySemiTransparent,
                                            ]}
                                        >
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    )}

                    <OfflineWithFeedback pendingAction={report?.pendingFields?.total}>
                        <MoneyRequestReportTotalSpend
                            isEmptyTransactions={false}
                            totalDisplaySpend={totalDisplaySpend}
                            report={report}
                            hasPendingAction={hasPendingAction}
                        />
                    </OfflineWithFeedback>
                </View>
            </View>
        </View>
    );
}

export default MoneyRequestReportListFooter;
