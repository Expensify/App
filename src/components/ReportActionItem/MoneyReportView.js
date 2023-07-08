import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions from '../withWindowDimensions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import MenuItem from '../MenuItem';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import * as UserUtils from '../../libs/UserUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import * as Task from '../../libs/actions/Task';
import CONST from '../../CONST';
import Checkbox from '../Checkbox';
import convertToLTR from '../../libs/convertToLTR';
import Text from '../Text';
import Icon from '../Icon';
import getButtonState from '../../libs/getButtonState';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import * as Session from '../../libs/actions/Session';
import * as Expensicons from '../Icon/Expensicons';
import variables from '../../styles/variables';
import * as CurrencyUtils from '../../libs/CurrencyUtils';


const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

function MoneyReportView(props) {
    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.report), props.report.currency);
    const isSettled = ReportUtils.isSettled(props.report.reportID);

    return (
        <>
            <View style={[styles.flexRow, styles.menuItemTextContainer, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text
                        style={[styles.textLabelSupporting, styles.lineHeightNormal, StyleUtils.getFontSizeStyle(variables.fontSizeNormal)]}
                        numberOfLines={1}
                    >
                        {props.translate('common.total')}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.justifyContentCenter]}>
                    {isSettled && (
                        <View style={[styles.defaultCheckmarkWrapper, styles.mh1]}>
                            <Icon
                                src={Expensicons.Checkmark}
                                fill={styles.success}
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
            {props.shouldShowHorizontalRule && <View style={styles.taskHorizontalRule} />}
        </>
    );
}

MoneyReportView.propTypes = propTypes;
MoneyReportView.displayName = 'MoneyReportView';

export default compose(withWindowDimensions, withLocalize, withCurrentUserPersonalDetails)(MoneyReportView);
