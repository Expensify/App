import Str from 'expensify-common/lib/str';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';

type MoneyReportViewProps = {
    /** The report currently being looked at */
    report: Report;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;
};

function MoneyReportView({report, policy, shouldShowHorizontalRule}: MoneyReportViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const isSettled = ReportUtils.isSettled(report.reportID);
    const isTotalUpdated = ReportUtils.hasUpdatedTotal(report);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(report);

    const shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend;
    const formattedTotalAmount = CurrencyUtils.convertToDisplayString(totalDisplaySpend, report.currency);
    const formattedOutOfPocketAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, report.currency);
    const formattedCompanySpendAmount = CurrencyUtils.convertToDisplayString(nonReimbursableSpend, report.currency);
    const isPartiallyPaid = Boolean(report?.pendingFields?.partial);

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables.fontSizeh1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    const sortedPolicyReportFields = useMemo<PolicyReportField[]>((): PolicyReportField[] => {
        const fields = ReportUtils.getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight);
    }, [policy, report]);

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth, true)]}>
                {!ReportUtils.isClosedExpenseReportWithNoExpenses(report) && (
                    <>
                        {ReportUtils.reportFieldsEnabled(report) &&
                            sortedPolicyReportFields.map((reportField) => {
                                const isTitleField = ReportUtils.isReportFieldOfTypeTitle(reportField);
                                const fieldValue = isTitleField ? report.reportName : reportField.value ?? reportField.defaultValue;
                                const isFieldDisabled = ReportUtils.isReportFieldDisabled(report, reportField, policy);
                                const fieldKey = ReportUtils.getReportFieldKey(reportField.fieldID);

                                return (
                                    <OfflineWithFeedback
                                        pendingAction={report.pendingFields?.[fieldKey]}
                                        errors={report.errorFields?.[fieldKey]}
                                        errorRowStyles={styles.ph5}
                                        key={`menuItem-${fieldKey}`}
                                    >
                                        <MenuItemWithTopDescription
                                            description={Str.UCFirst(reportField.name)}
                                            title={fieldValue}
                                            onPress={() => Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report.reportID, report.policyID ?? '', reportField.fieldID))}
                                            shouldShowRightIcon
                                            disabled={isFieldDisabled}
                                            wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                                            shouldGreyOutWhenDisabled={false}
                                            numberOfLinesTitle={0}
                                            interactive
                                            shouldStackHorizontally={false}
                                            onSecondaryInteraction={() => {}}
                                            hoverAndPressStyle={false}
                                            titleWithTooltips={[]}
                                        />
                                    </OfflineWithFeedback>
                                );
                            })}
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
                                <Text
                                    numberOfLines={1}
                                    style={[styles.taskTitleMenuItem, styles.alignSelfCenter, !isTotalUpdated && styles.offlineFeedback.pending]}
                                >
                                    {formattedTotalAmount}
                                </Text>
                            </View>
                        </View>
                        {Boolean(shouldShowBreakdown) && (
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
                        <SpacerView
                            shouldShow={shouldShowHorizontalRule}
                            style={[shouldShowHorizontalRule && styles.reportHorizontalRule]}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

MoneyReportView.displayName = 'MoneyReportView';

export default MoneyReportView;
