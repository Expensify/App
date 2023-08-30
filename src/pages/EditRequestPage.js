import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as TransactionUtils from '../libs/TransactionUtils';
import * as Policy from '../libs/actions/Policy';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../components/withCurrentUserPersonalDetails';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestMerchantPage from './EditRequestMerchantPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestAmountPage from './EditRequestAmountPage';
import reportPropTypes from './reportPropTypes';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report object for the thread report */
    report: reportPropTypes,

    /** The parent report object for the thread report */
    parentReport: reportPropTypes,

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

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: {},
    parentReport: {},
    policy: null,
    session: {
        email: null,
    },
};

function EditRequestPage({report, route, parentReport, policy, session}) {
    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const transaction = TransactionUtils.getLinkedTransaction(parentReportAction);
    const {amount: transactionAmount, currency: transactionCurrency, comment: transactionDescription, merchant: transactionMerchant} = ReportUtils.getTransactionDetails(transaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;

    // Take only the YYYY-MM-DD value
    const transactionCreated = TransactionUtils.getCreated(transaction);
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');

    const isDeleted = ReportActionsUtils.isDeletedAction(parentReportAction);
    const isSettled = ReportUtils.isSettled(parentReport.reportID);

    const isAdmin = Policy.isAdminOfFreePolicy([policy]) && ReportUtils.isExpenseReport(parentReport);
    const isRequestor = ReportUtils.isMoneyRequestReport(parentReport) && lodashGet(session, 'accountID', null) === parentReportAction.actorAccountID;
    const canEdit = !isSettled && !isDeleted && (isAdmin || isRequestor);

    // Dismiss the modal when the request is paid or deleted
    useEffect(() => {
        if (canEdit) {
            return;
        }
        Navigation.dismissModal();
    }, [canEdit]);

    // Update the transaction object and close the modal
    function editMoneyRequest(transactionChanges) {
        IOU.editMoneyRequest(transaction.transactionID, report.reportID, transactionChanges);
        Navigation.dismissModal();
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
                    // In case the comment hasn't been changed, do not make the API request.
                    if (transactionChanges.comment.trim() === transactionDescription) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest({comment: transactionChanges.comment.trim()});
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={transactionCreated}
                onSubmit={(transactionChanges) => {
                    // In case the date hasn't been changed, do not make the API request.
                    if (transactionChanges.created === transactionCreated) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest(transactionChanges);
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount}
                defaultCurrency={defaultCurrency}
                reportID={report.reportID}
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges));
                    // In case the amount hasn't been changed, do not make the API request.
                    if (amount === transactionAmount && transactionCurrency === defaultCurrency) {
                        Navigation.dismissModal();
                        return;
                    }
                    // Temporarily disabling currency editing and it will be enabled as a quick follow up
                    editMoneyRequest({
                        amount,
                        currency: defaultCurrency,
                    });
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.MERCHANT) {
        return (
            <EditRequestMerchantPage
                defaultMerchant={transactionMerchant}
                onSubmit={(transactionChanges) => {
                    // In case the merchant hasn't been changed, do not make the API request.
                    if (transactionChanges.merchant.trim() === transactionMerchant) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest({merchant: transactionChanges.merchant.trim()});
                }}
            />
        );
    }

    return null;
}

EditRequestPage.displayName = 'EditRequestPage';
EditRequestPage.propTypes = propTypes;
EditRequestPage.defaultProps = defaultProps;
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`,
        },
    }),
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(EditRequestPage);
