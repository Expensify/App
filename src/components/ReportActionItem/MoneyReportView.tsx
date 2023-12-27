import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import variables from '@styles/variables';
import type {Report} from '@src/types/onyx';

type MoneyReportViewProps = {
    /** The report currently being looked at */
    report: Report;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;
};

function MoneyReportView({report, shouldShowHorizontalRule}: MoneyReportViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const isSettled = ReportUtils.isSettled(report.reportID);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(report);

    const shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend;
    const formattedTotalAmount = CurrencyUtils.convertToDisplayString(totalDisplaySpend, report.currency, ReportUtils.hasOnlyDistanceRequestTransactions(report.reportID));
    const formattedOutOfPocketAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, report.currency);
    const formattedCompanySpendAmount = CurrencyUtils.convertToDisplayString(nonReimbursableSpend, report.currency);

    const subAmountTextStyles: StyleProp<TextStyle> = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables.fontSizeh1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth, true)]}>
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
                        {isSettled && (
                            <View style={[styles.defaultCheckmarkWrapper, styles.mh2]}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={theme.success}
                                />
                            </View>
                        )}
                        <Text
                            numberOfLines={1}
                            style={[styles.taskTitleMenuItem, styles.alignSelfCenter]}
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
            </View>
        </View>
    );
}

MoneyReportView.displayName = 'MoneyReportView';

export default MoneyReportView;
