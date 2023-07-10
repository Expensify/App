import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get'
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
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
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
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
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import DateUtils from '../../libs/DateUtils';
import * as CurrencyUtils from '../../libs/CurrencyUtils';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,


    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

function MoneyRequestView(props) {
    const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
    const {amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription} = ReportUtils.getMoneyRequestAction(parentReportAction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const transactionDate = lodashGet(parentReportAction, ['created']);
    const formattedTransactionDate = DateUtils.getDateStringFromISOTimestamp(transactionDate);

    const moneyRequestReport = props.parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);

    return (
        <View>
            <MenuItemWithTopDescription
                title={formattedTransactionAmount}
                shouldShowTitleIcon={isSettled}
                titleIcon={Expensicons.Checkmark}
                description={`${props.translate('iou.amount')} • ${props.translate('iou.cash')}${isSettled ? ` • ${props.translate('iou.settledExpensify')}` : ''}`}
                titleStyle={styles.newKansasLarge}
                disabled={isSettled}
                // Note: These options are temporarily disabled while we figure out the required API changes
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
            />
            <MenuItemWithTopDescription
                description={props.translate('common.description')}
                title={transactionDescription}
                disabled={isSettled}
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
            />
            <MenuItemWithTopDescription
                description={props.translate('common.date')}
                title={formattedTransactionDate}
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
            />
            {props.shouldShowHorizontalRule && <View style={styles.taskHorizontalRule} />}
        </View>
    );
}

MoneyRequestView.propTypes = propTypes;
MoneyRequestView.displayName = 'MoneyRequestView';

export default compose(
    withWindowDimensions,
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        parentReport: {
            key: (props) => `${ONYXKEYS.COLLECTION.REPORT}${props.report.parentReportID}`,
        },
    }),
    )(MoneyRequestView);
