import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {resolveReportFieldValue} from '@libs/Formula';
import Navigation from '@libs/Navigation/Navigation';
import {
    getFieldViolation,
    getFieldViolationTranslation,
    getMoneyRequestSpendBreakdown,
    getReportFieldKey,
    getReportFieldMaps,
    hasUpdatedTotal,
    isClosedExpenseReportWithNoExpenses as isClosedExpenseReportWithNoExpensesReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
    isPaidGroupPolicyExpenseReport as isPaidGroupPolicyExpenseReportUtils,
    isReportFieldDisabled,
    isReportFieldDisabledForUser,
    isReportFieldOfTypeTitle,
    isSettled as isSettledReportUtils,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/inbox/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {clearReportFieldKeyErrors} from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

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
};

function MoneyReportView({report, policy, isCombinedReport = false, shouldShowTotal = true, shouldHideThreadDividerLine, pendingAction}: MoneyReportViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);
    const {isOffline} = useNetwork();
    const isSettled = isSettledReportUtils(report?.reportID);
    const isTotalUpdated = hasUpdatedTotal(report, policy);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    const shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend && shouldShowTotal;
    const formattedTotalAmount = convertToDisplayString(totalDisplaySpend, report?.currency);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const isPartiallyPaid = !!report?.pendingFields?.partial;

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables.fontSizeH1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    const [violations] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${report?.reportID}`, {canBeMissing: true});

    const {sortedPolicyReportFields, fieldValues, fieldsByName} = useMemo(() => {
        const {fieldValues: values, fieldsByName: byName} = getReportFieldMaps(report, policy?.fieldList ?? {});
        const sorted = Object.values(byName)
            .filter((field) => field.target === report?.type)
            .sort(({orderWeight: a}, {orderWeight: b}) => a - b);
        return {sortedPolicyReportFields: sorted, fieldValues: values, fieldsByName: byName};
    }, [policy?.fieldList, report]);

    const enabledReportFields = sortedPolicyReportFields.filter(
        (reportField) => !isReportFieldDisabled(report, reportField, policy) || reportField.type === CONST.REPORT_FIELD_TYPES.FORMULA,
    );
    const isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && isReportFieldOfTypeTitle(enabledReportFields.at(0));
    const isClosedExpenseReportWithNoExpenses = isClosedExpenseReportWithNoExpensesReportUtils(report);
    const isPaidGroupPolicyExpenseReport = isPaidGroupPolicyExpenseReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);

    const shouldShowReportField =
        !isClosedExpenseReportWithNoExpenses &&
        (isPaidGroupPolicyExpenseReport || isInvoiceReport) &&
        (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
        !sortedPolicyReportFields.every(shouldHideSingleReportField);

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

    return (
        <>
            <View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground />
                {!isClosedExpenseReportWithNoExpenses && (
                    <>
                        {(isPaidGroupPolicyExpenseReport || isInvoiceReport) &&
                            policy?.areReportFieldsEnabled &&
                            (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
                            sortedPolicyReportFields.map((reportField) => {
                                if (shouldHideSingleReportField(reportField)) {
                                    return null;
                                }

                                const fieldValue = resolveReportFieldValue(reportField, report, policy, fieldValues, fieldsByName);
                                const isFieldDisabled = isReportFieldDisabledForUser(report, reportField, policy);
                                const fieldKey = getReportFieldKey(reportField.fieldID);

                                const violation = isFieldDisabled ? undefined : getFieldViolation(violations, reportField);
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
                                                Navigation.navigate(
                                                    ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report?.reportID, report?.policyID, reportField.fieldID, Navigation.getReportRHPActiveRoute()),
                                                );
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
                        {shouldShowTotal && (
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
                                    {!isTotalUpdated && !isOffline ? (
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
                                <View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv1]}>
                                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                                        <Text
                                            style={[styles.textLabelSupporting]}
                                            numberOfLines={1}
                                        >
                                            {translate('cardTransactions.outOfPocket')}
                                        </Text>
                                    </View>
                                    <View style={[styles.flexRow, styles.justifyContentCenter]}>
                                        <Text
                                            numberOfLines={1}
                                            style={subAmountTextStyles}
                                        >
                                            {formattedOutOfPocketAmount}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv1]}>
                                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                                        <Text
                                            style={[styles.textLabelSupporting]}
                                            numberOfLines={1}
                                        >
                                            {translate('cardTransactions.companySpend')}
                                        </Text>
                                    </View>
                                    <View style={[styles.flexRow, styles.justifyContentCenter]}>
                                        <Text
                                            numberOfLines={1}
                                            style={subAmountTextStyles}
                                        >
                                            {formattedCompanySpendAmount}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </>
                )}
            </View>
            {(shouldShowReportField || shouldShowBreakdown || shouldShowTotal) && renderThreadDivider}
        </>
    );
}

export default MoneyReportView;
