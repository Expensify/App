import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

function MoneyReportView(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isSettled = ReportUtils.isSettled(props.report.reportID);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(props.report);

    const shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend;
    const formattedTotalAmount = CurrencyUtils.convertToDisplayString(totalDisplaySpend, props.report.currency, ReportUtils.hasOnlyDistanceRequestTransactions(props.report.reportID));
    const formattedOutOfPocketAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, props.report.currency);
    const formattedCompanySpendAmount = CurrencyUtils.convertToDisplayString(nonReimbursableSpend, props.report.currency);

    const subAmountTextStyles = [styles.taskTitleMenuItem, styles.alignSelfCenter, StyleUtils.getFontSizeStyle(variables.fontSizeh1), StyleUtils.getColorStyle(theme.textSupporting)];

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth, true)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth, true)]}>
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
                {shouldShowBreakdown ? (
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
                ) : undefined}
                <SpacerView
                    shouldShow={props.shouldShowHorizontalRule}
                    style={[props.shouldShowHorizontalRule ? styles.reportHorizontalRule : {}]}
                />
            </View>
        </View>
    );
}

MoneyReportView.propTypes = propTypes;
MoneyReportView.displayName = 'MoneyReportView';

export default withWindowDimensions(MoneyReportView);
