import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import MoneyRequestViewReportFields from '@components/MoneyRequestReportView/MoneyRequestViewReportFields';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportTransactions from '@hooks/useReportTransactions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSingleTransactionReport} from '@libs/MoneyRequestReportUtils';
import {isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {
    getBillableAndTaxTotal,
    getMoneyRequestSpendBreakdown,
    getReportFieldMaps,
    hasUpdatedTotal,
    isClosedExpenseReportWithNoExpenses as isClosedExpenseReportWithNoExpensesReportUtils,
    isReportFieldTargetMatchingReport,
    isSettled as isSettledReportUtils,
    shouldDisplayReportFields as shouldDisplayReportFieldsUtils,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import AnimatedEmptyStateBackground from '@pages/inbox/report/AnimatedEmptyStateBackground';

import {fontScale} from '@styles/typography';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type MoneyReportViewProps = {
    report: OnyxEntry<Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

    /** Indicates whether the iou report is a combine report */
    isCombinedReport?: boolean;

    shouldShowTotal?: boolean;
    shouldHideThreadDividerLine: boolean;
    pendingAction?: PendingAction;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground?: boolean;

    /**
     * When true, the Total amount is rendered as a loading indicator regardless of `isOffline`.
     * Use this when the caller knows the underlying total is being recomputed and a
     * network-independent update is expected, so falling back to the (stale) amount while offline
     * would be misleading.
     */
    isTotalPending?: boolean;
};

function MoneyReportView({
    report,
    policy,
    isCombinedReport = false,
    shouldShowTotal = true,
    shouldHideThreadDividerLine,
    pendingAction,
    shouldShowAnimatedBackground = true,
    isTotalPending = false,
}: MoneyReportViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(report?.reportID)}`);
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const isSettled = isSettledReportUtils(report?.reportID);
    const isTotalUpdated = hasUpdatedTotal(report, policy) && !isTotalPending;

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const transactions = useReportTransactions(report?.reportID);
    const {billableTotal, taxTotal} = getBillableAndTaxTotal(report, transactions);

    const isTaxEnabled = isPolicyTaxEnabled(policy);
    // Exclude transactions pending deletion so a report being reduced to a single expense (e.g. deleting one of two) is treated as single immediately,
    // instead of waiting for the optimistic delete to be removed from Onyx.
    // While offline the deleted expense is still rendered, so keep counting it to stay consistent with the visible transaction list.
    const visibleTransactions = transactions.filter((transaction) => isOffline || !isTransactionPendingDelete(transaction));
    const isSingleExpenseReport = isSingleTransactionReport(report, visibleTransactions);
    // For a one-expense report the Total/Billable/Tax rows just repeat the expense's own amount (shown on its Amount field,
    // including the converted value), so hide the whole report-level breakdown block.
    const shouldShowReimbursabilityRow = !!nonReimbursableSpend;
    const shouldShowBillableRow = !!billableTotal;
    const shouldShowTaxRow = !!taxTotal && isTaxEnabled;
    const shouldShowBreakdown = !isSingleExpenseReport && (shouldShowReimbursabilityRow || shouldShowBillableRow || shouldShowTaxRow);
    const shouldShowTotalRow = shouldShowTotal && !isSingleExpenseReport;
    const formattedTotalAmount = convertToDisplayString(totalDisplaySpend, report?.currency);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const formattedBillableAmount = convertToDisplayString(billableTotal, report?.currency);
    const formattedTaxAmount = convertToDisplayString(taxTotal, report?.currency);
    const isPartiallyPaid = !!report?.pendingFields?.partial;

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(fontScale.h2),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    // Only used to decide whether the report field block is worth rendering — `MoneyRequestViewReportFields` builds and
    // resolves the fields it displays itself.
    const sortedPolicyReportFields = useMemo(() => {
        const {fieldsByName} = getReportFieldMaps(report, policy?.fieldList ?? {}, reportNameValuePairs);
        return Object.values(fieldsByName)
            .filter((field) => isReportFieldTargetMatchingReport(report, field))
            .sort(({orderWeight: a}, {orderWeight: b}) => a - b);
    }, [policy?.fieldList, report, reportNameValuePairs]);

    const isOnlyTitleFieldEnabled = sortedPolicyReportFields.every(shouldHideSingleReportField);
    const isClosedExpenseReportWithNoExpenses = isClosedExpenseReportWithNoExpensesReportUtils(report);
    const shouldDisplayReportFields = shouldDisplayReportFieldsUtils(report, policy);
    const shouldShowReportField = !isClosedExpenseReportWithNoExpenses && shouldDisplayReportFields && !isOnlyTitleFieldEnabled;

    const hasPendingAction = transactions.some(getTransactionPendingAction);

    const renderThreadDivider = useMemo(
        () =>
            shouldHideThreadDividerLine ? (
                <UnreadActionIndicator
                    reportActionID={report?.reportID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                />
            ) : (
                <SpacerView
                    shouldShow
                    style={styles.reportHorizontalRule}
                />
            ),
        [shouldHideThreadDividerLine, report?.reportID, styles.reportHorizontalRule],
    );
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    return (
        <>
            <View style={[styles.pRelative]}>
                {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
                {!isClosedExpenseReportWithNoExpenses && (
                    <>
                        {shouldDisplayReportFields &&
                            (!isCombinedReport || !isOnlyTitleFieldEnabled) && (
                                // One-expense reports show the same editable grid as the report view, so a field is changed
                                // in place here too instead of opening the report field editor page.
                                <MoneyRequestViewReportFields
                                    report={report}
                                    policy={policy}
                                    pendingAction={pendingAction}
                                    style={styles.mt5}
                                />
                            )}
                        {shouldShowTotalRow && (
                            <View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
                                <View style={[styles.flex1, styles.justifyContentCenter]}>
                                    <Text
                                        style={[styles.textLabelSupporting]}
                                        numberOfLines={1}
                                    >
                                        {translate('common.total')}
                                    </Text>
                                </View>
                                <View style={[styles.flexRow, styles.justifyContentCenter]}>
                                    {isSettled && !isPartiallyPaid && (
                                        <View style={[styles.defaultCheckmarkWrapper, styles.mh2]}>
                                            <Icon
                                                src={icons.Checkmark}
                                                fill={theme.success}
                                            />
                                        </View>
                                    )}
                                    {!isTotalUpdated && (!isOffline || isTotalPending) ? (
                                        <ActivityIndicator
                                            style={[styles.moneyRequestLoadingHeight]}
                                            color={theme.textSupporting}
                                        />
                                    ) : (
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.taskTitleMenuItem, styles.alignSelfCenter, !isTotalUpdated && styles.offlineFeedbackPending]}
                                        >
                                            {formattedTotalAmount}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {!!shouldShowBreakdown && (
                            <>
                                {[
                                    {label: 'cardTransactions.outOfPocket', value: formattedOutOfPocketAmount, show: shouldShowReimbursabilityRow},
                                    {label: 'cardTransactions.companySpend', value: formattedCompanySpendAmount, show: shouldShowReimbursabilityRow},
                                    {label: 'common.billable', value: formattedBillableAmount, show: shouldShowBillableRow},
                                    {label: 'common.tax', value: formattedTaxAmount, show: shouldShowTaxRow},
                                ]
                                    .filter(({show}) => show)
                                    .map(({label, value}) => (
                                        <View
                                            key={label}
                                            style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv1]}
                                        >
                                            <View style={[styles.flex1, styles.justifyContentCenter]}>
                                                <Text
                                                    style={[styles.textLabelSupporting, hasPendingAction && styles.opacitySemiTransparent]}
                                                    numberOfLines={1}
                                                >
                                                    {translate(label as TranslationPaths)}
                                                </Text>
                                            </View>
                                            <View style={[styles.flexRow, styles.justifyContentCenter]}>
                                                <Text
                                                    numberOfLines={1}
                                                    style={[subAmountTextStyles, hasPendingAction && styles.opacitySemiTransparent]}
                                                >
                                                    {value}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                            </>
                        )}
                    </>
                )}
            </View>
            {(shouldShowReportField || shouldShowBreakdown || shouldShowTotalRow) && renderThreadDivider}
        </>
    );
}

export default MoneyReportView;
