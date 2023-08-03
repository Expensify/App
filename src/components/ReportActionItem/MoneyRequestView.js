import React from 'react';
import {View, Image} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions from '../withWindowDimensions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import DateUtils from '../../libs/DateUtils';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import EmptyStateBackgroundImage from '../../../assets/images/empty-state_background-fade.png';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    parentReport: {},
};

function MoneyRequestView(props) {
    const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
    const {amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription} = ReportUtils.getMoneyRequestAction(parentReportAction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const transactionDate = lodashGet(parentReportAction, ['created']);
    const formattedTransactionDate = DateUtils.getDateStringFromISOTimestamp(transactionDate);

    const moneyRequestReport = props.parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const {translate} = useLocalize();

    return (
        <View>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth), StyleUtils.getMinimumHeight(CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT.MIN_HEIGHT)]}>
                <Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(true)]}
                />
            </View>
            <MenuItemWithTopDescription
                title={formattedTransactionAmount}
                shouldShowTitleIcon={isSettled}
                titleIcon={Expensicons.Checkmark}
                description={`${translate('iou.amount')} • ${translate('iou.cash')}${isSettled ? ` • ${translate('iou.settledExpensify')}` : ''}`}
                titleStyle={styles.newKansasLarge}
                disabled={isSettled}
                // Note: These options are temporarily disabled while we figure out the required API changes
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
            />
            <MenuItemWithTopDescription
                description={translate('common.description')}
                title={transactionDescription}
                disabled={isSettled}
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
            />
            <MenuItemWithTopDescription
                description={translate('common.date')}
                title={formattedTransactionDate}
                disabled={isSettled}
                // shouldShowRightIcon={!isSettled}
                // onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(props.report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
            />
            {props.shouldShowHorizontalRule && <View style={styles.reportHorizontalRule} />}
        </View>
    );
}

MoneyRequestView.propTypes = propTypes;
MoneyRequestView.defaultProps = defaultProps;
MoneyRequestView.displayName = 'MoneyRequestView';

export default compose(
    withWindowDimensions,
    withCurrentUserPersonalDetails,
    withOnyx({
        parentReport: {
            key: (props) => `${ONYXKEYS.COLLECTION.REPORT}${props.report.parentReportID}`,
        },
    }),
)(MoneyRequestView);
