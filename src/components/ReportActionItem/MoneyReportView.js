import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import * as ReportUtils from '../../libs/ReportUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import variables from '../../styles/variables';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import useLocalize from '../../hooks/useLocalize';
import AnimatedEmptyStateBackground from '../../pages/home/report/AnimatedEmptyStateBackground';
import SpacerView from '../SpacerView';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

function MoneyReportView(props) {
    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.report), props.report.currency);
    const isSettled = ReportUtils.isSettled(props.report.reportID);
    const {translate} = useLocalize();

    return (
        <View>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth), StyleUtils.getMinimumHeight(CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT.MIN_HEIGHT)]}>
                <AnimatedEmptyStateBackground />
            </View>
            <View style={[styles.flexRow, styles.menuItemTextContainer, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                    <Text
                        style={[styles.textLabelSupporting, StyleUtils.getFontSizeStyle(variables.fontSizeNormal)]}
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
                                fill={themeColors.success}
                            />
                        </View>
                    )}
                    <Text
                        numberOfLines={1}
                        style={[styles.taskTitleMenuItem, styles.alignSelfCenter]}
                    >
                        {formattedAmount}
                    </Text>
                </View>
            </View>
            <SpacerView
                shouldShow={props.shouldShowHorizontalRule}
                style={[props.shouldShowHorizontalRule ? styles.reportHorizontalRule : {}]}
            />
        </View>
    );
}

MoneyReportView.propTypes = propTypes;
MoneyReportView.displayName = 'MoneyReportView';

export default withWindowDimensions(MoneyReportView);
