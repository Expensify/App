import React from 'react';
import {View, Image} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import * as Policy from '../../libs/actions/Policy';
import Navigation from '../../libs/Navigation/Navigation';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as TransactionUtils from '../../libs/TransactionUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import EmptyStateBackgroundImage from '../../../assets/images/empty-state_background-fade.png';
import useLocalize from '../../hooks/useLocalize';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    parentReport: {},
    policy: null,
    session: {
        email: null,
    },
};

function MoneyRequestView({report, parentReport, shouldShowHorizontalRule, policy, session}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const moneyRequestReport = parentReport;
    const transaction = TransactionUtils.getLinkedTransaction(parentReportAction);
    const {created: transactionDate, amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription} = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);

    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const isAdmin = Policy.isAdminOfFreePolicy([policy]) && ReportUtils.isExpenseReport(moneyRequestReport);
    const isRequestor = ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(session, 'accountID', null) === parentReportAction.actorAccountID;
    const canEdit = !isSettled && (isAdmin || isRequestor);

    let description = `${translate('iou.amount')} • ${translate('iou.cash')}`;
    if (isSettled) {
        description += ` • ${translate('iou.settledExpensify')}`;
    } else if (report.isWaitingOnBankAccount) {
        description += ` • ${translate('iou.pending')}`;
    }

    // A temporary solution to hide the transaction detail
    // This will be removed after we properly add the transaction as a prop
    if (ReportActionsUtils.isDeletedAction(parentReportAction)) {
        return null;
    }

    return (
        <View>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth), StyleUtils.getMinimumHeight(CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT.MIN_HEIGHT)]}>
                <Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(true)]}
                />
            </View>
            <MenuItemWithTopDescription
                title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                shouldShowTitleIcon={isSettled}
                titleIcon={Expensicons.Checkmark}
                description={description}
                titleStyle={styles.newKansasLarge}
                disabled={isSettled || !canEdit}
                shouldShowRightIcon={canEdit}
                onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
            />
            <MenuItemWithTopDescription
                description={translate('common.description')}
                title={transactionDescription}
                disabled={isSettled || !canEdit}
                shouldShowRightIcon={canEdit}
                onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
            />
            <MenuItemWithTopDescription
                description={translate('common.date')}
                title={transactionDate}
                disabled={isSettled || !canEdit}
                shouldShowRightIcon={canEdit}
                onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
            />
            {shouldShowHorizontalRule && <View style={styles.reportHorizontalRule} />}
        </View>
    );
}

MoneyRequestView.propTypes = propTypes;
MoneyRequestView.defaultProps = defaultProps;
MoneyRequestView.displayName = 'MoneyRequestView';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyRequestView);
