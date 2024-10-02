import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import * as reportActions from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type MoneyReportViewProps = {
    /** The report currently being looked at */
    report: Report;

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
    const {isOffline} = useNetwork();
    const isSettled = ReportUtils.isSettled(report.reportID);
    const isTotalUpdated = ReportUtils.hasUpdatedTotal(report, policy);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(report);

    const shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend && shouldShowTotal;
    const formattedTotalAmount = CurrencyUtils.convertToDisplayString(totalDisplaySpend, report.currency);
    const formattedOutOfPocketAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, report.currency);
    const formattedCompanySpendAmount = CurrencyUtils.convertToDisplayString(nonReimbursableSpend, report.currency);
    const isPartiallyPaid = !!report?.pendingFields?.partial;

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables.fontSizeh1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    const [violations] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${report.reportID}`);

    const sortedPolicyReportFields = useMemo<PolicyReportField[]>((): PolicyReportField[] => {
        const fields = ReportUtils.getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.filter((field) => field.target === report.type).sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight);
    }, [policy, report]);

    const enabledReportFields = sortedPolicyReportFields.filter((reportField) => !ReportUtils.isReportFieldDisabled(report, reportField, policy));
    const isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && ReportUtils.isReportFieldOfTypeTitle(enabledReportFields[0]);
    const shouldShowReportField =
        !ReportUtils.isClosedExpenseReportWithNoExpenses(report) && ReportUtils.isPaidGroupPolicyExpenseReport(report) && (!isCombinedReport || !isOnlyTitleFieldEnabled);

    const renderThreadDivider = useMemo(
        () =>
            shouldHideThreadDividerLine && !isCombinedReport ? (
                <UnreadActionIndicator
                    reportActionID={report.reportID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                />
            ) : (
                <SpacerView
                    shouldShow={!shouldHideThreadDividerLine}
                    style={[!shouldHideThreadDividerLine ? styles.reportHorizontalRule : {}]}
                />
            ),
        [shouldHideThreadDividerLine, report.reportID, styles.reportHorizontalRule, isCombinedReport],
    );

    return (
        <>
            <View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground />
                {!ReportUtils.isClosedExpenseReportWithNoExpenses(report) && (
                    <>
                        {ReportUtils.isPaidGroupPolicyExpenseReport(report) &&
                            policy?.areReportFieldsEnabled &&
                            (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
                            sortedPolicyReportFields.map((reportField) => {
                                if (ReportUtils.isReportFieldOfTypeTitle(reportField)) {
                                    return null;
                                }

                                const fieldValue = reportField.value ?? reportField.defaultValue;
                                const isFieldDisabled = ReportUtils.isReportFieldDisabled(report, reportField, policy);
                                const fieldKey = ReportUtils.getReportFieldKey(reportField.fieldID);

                                const violation = ReportUtils.getFieldViolation(violations, reportField);
                                const violationTranslation = ReportUtils.getFieldViolationTranslation(reportField, violation);

                                return (
                                    <OfflineWithFeedback
                                        // Need to return undefined when we have pendingAction to avoid the duplicate pending action
                                        pendingAction={pendingAction ? undefined : report.pendingFields?.[fieldKey]}
                                        errors={report.errorFields?.[fieldKey]}
                                        errorRowStyles={styles.ph5}
                                        key={`menuItem-${fieldKey}`}
                                        onClose={() => reportActions.clearReportFieldKeyErrors(report.reportID, fieldKey)}
                                    >
                                        <MenuItemWithTopDescription
                                            description={Str.UCFirst(reportField.name)}
                                            title={fieldValue}
                                            onPress={() =>
                                                Navigation.navigate(
                                                    ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(
                                                        report.reportID,
                                                        report.policyID ?? '-1',
                                                        reportField.fieldID,
                                                        Navigation.getReportRHPActiveRoute(),
                                                    ),
                                                )
                                            }
                                            shouldShowRightIcon
                                            disabled={isFieldDisabled}
                                            wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                                            shouldGreyOutWhenDisabled={false}
                                            numberOfLinesTitle={0}
                                            interactive
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
                                                src={Expensicons.Checkmark}
                                                fill={theme.success}
                                            />
                                        </View>
                                    )}
                                    {!isTotalUpdated && !isOffline ? (
                                        <ActivityIndicator
                                            size="small"
                                            style={[styles.moneyRequestLoadingHeight]}
                                            color={theme.textSupporting}
                                        />
                                    ) : (
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.taskTitleMenuItem, styles.alignSelfCenter, !isTotalUpdated && styles.offlineFeedback.pending]}
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

MoneyReportView.displayName = 'MoneyReportView';

export default MoneyReportView;
