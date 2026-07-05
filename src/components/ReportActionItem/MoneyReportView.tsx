import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useReportTransactions from '@hooks/useReportTransactions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {resolveReportFieldValue} from '@libs/Formula';
import {isSingleTransactionReport} from '@libs/MoneyRequestReportUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {
    getBillableAndTaxTotal,
    getFieldViolation,
    getFieldViolationTranslation,
    getMoneyRequestSpendBreakdown,
    getReportFieldKey,
    getReportFieldMaps,
    hasUpdatedTotal,
    isClosedExpenseReportWithNoExpenses as isClosedExpenseReportWithNoExpensesReportUtils,
    isGroupPolicyExpenseReport as isGroupPolicyExpenseReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
    isReportFieldDisabledForUser,
    isSettled as isSettledReportUtils,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import AnimatedEmptyStateBackground from '@pages/inbox/report/AnimatedEmptyStateBackground';

import variables from '@styles/variables';

import type {TranslationPaths} from '@src/languages/types';
import {clearReportFieldKeyErrors} from '@src/libs/actions/Report';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';

type MoneyReportViewProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

    /** Indicates whether the iou report is a combine report */
    isCombinedReport?: boolean;

    /** Indicates whether the total should be shown */
    shouldShowTotal?: boolean;

    /** Flag to show, hide the thread divider line */
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
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
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
    const totalActivityReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyReportView.Total',
        isTotalUpdated,
        isOffline,
        isTotalPending,
    };

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables.fontSizeH1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    const {sortedPolicyReportFields, fieldValues, fieldsByName} = useMemo(() => {
        const {fieldValues: values, fieldsByName: byName} = getReportFieldMaps(report, policy?.fieldList ?? {});
        const sorted = Object.values(byName)
            .filter((field) => field.target === report?.type)
            .sort(({orderWeight: a}, {orderWeight: b}) => a - b);
        return {sortedPolicyReportFields: sorted, fieldValues: values, fieldsByName: byName};
    }, [policy?.fieldList, report]);

    // Whether the only report field configured for this report is the title field. This must be based on which fields are
    // present/displayable, not on which are currently editable: after approval every field becomes read-only for the
    // submitter, but a still-present custom field should keep showing. `shouldHideSingleReportField` hides the title field
    // and list fields with no enabled option, so if it's true for every field then only the title field remains.
    const isOnlyTitleFieldEnabled = sortedPolicyReportFields.every(shouldHideSingleReportField);
    const isClosedExpenseReportWithNoExpenses = isClosedExpenseReportWithNoExpensesReportUtils(report);
    const isGroupPolicyExpenseReport = isGroupPolicyExpenseReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);

    const shouldShowReportField = !isClosedExpenseReportWithNoExpenses && (isGroupPolicyExpenseReport || isInvoiceReport) && !!policy?.areReportFieldsEnabled && !isOnlyTitleFieldEnabled;

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
                        {(isGroupPolicyExpenseReport || isInvoiceReport) &&
                            !!policy?.areReportFieldsEnabled &&
                            (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
                            sortedPolicyReportFields.map((reportField) => {
                                if (shouldHideSingleReportField(reportField)) {
                                    return null;
                                }

                                const fieldValue = resolveReportFieldValue(reportField, report, policy, fieldValues, fieldsByName);
                                const isFieldDisabled = isReportFieldDisabledForUser(report, reportField, policy, currentUserAccountID);
                                const fieldKey = getReportFieldKey(reportField.fieldID);

                                const violation = isFieldDisabled ? undefined : getFieldViolation(reportField);
                                const violationTranslation = getFieldViolationTranslation(reportField, violation);

                                return (
                                    <OfflineWithFeedback
                                        // Need to return undefined when we have pendingAction to avoid the duplicate pending action
                                        pendingAction={pendingAction ? undefined : report?.pendingFields?.[fieldKey as keyof typeof report.pendingFields]}
                                        errors={report?.errorFields?.[fieldKey]}
                                        errorRowStyles={styles.ph5}
                                        key={`menuItem-${fieldKey}`}
                                        onClose={() => clearReportFieldKeyErrors(report?.reportID, fieldKey)}
                                    >
                                        <MenuItemWithTopDescription
                                            description={Str.UCFirst(reportField.name)}
                                            title={fieldValue}
                                            onPress={() => {
                                                if (!report?.policyID) {
                                                    return;
                                                }

                                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EDIT_REPORT_FIELD.getRoute(report.policyID, reportField.fieldID)));
                                            }}
                                            shouldShowRightIcon={!isFieldDisabled}
                                            wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                                            shouldGreyOutWhenDisabled={false}
                                            numberOfLinesTitle={0}
                                            interactive={!isFieldDisabled}
                                            shouldStackHorizontally={false}
                                            onSecondaryInteraction={() => {}}
                                            titleWithTooltips={[]}
                                            brickRoadIndicator={violation ? 'error' : undefined}
                                            errorText={violationTranslation}
                                        />
                                    </OfflineWithFeedback>
                                );
                            })}
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
                                            reasonAttributes={totalActivityReasonAttributes}
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
