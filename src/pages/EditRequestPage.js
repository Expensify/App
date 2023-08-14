import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {format} from 'date-fns';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as TransactionUtils from '../libs/TransactionUtils';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
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
};

const defaultProps = {
    report: {},
};

function EditRequestPage({report, route}) {
    const transactionID = lodashGet(ReportActionsUtils.getParentReportAction(report), 'originalMessage.IOUTransactionID', '');
    const transaction = TransactionUtils.getTransaction(transactionID);
    const transactionDescription = TransactionUtils.getDescription(transaction);
    const transactionAmount = TransactionUtils.getAmount(transaction, ReportUtils.isExpenseReport(ReportUtils.getParentReport(report)));
    const transactionCurrency = TransactionUtils.getCurrency(transaction);

    // Take only the YYYY-MM-DD value
    const transactionCreatedDate = new Date(TransactionUtils.getCreated(transaction));
    const transactionCreated = format(transactionCreatedDate, CONST.DATE.FNS_FORMAT_STRING);
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');

    // Update the transaction object and close the modal
    function editMoneyRequest(transactionChanges) {
        IOU.editMoneyRequest(transactionID, report.reportID, transactionChanges);
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
                defaultCurrency={transactionCurrency}
                reportID={report.reportID}
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToSmallestUnit(transactionCurrency, Number.parseFloat(transactionChanges));
                    // In case the amount hasn't been changed, do not make the API request.
                    if (amount === transactionAmount) {
                        Navigation.dismissModal();
                        return;
                    }
                    // Temporarily disabling currency editing and it will be enabled as a quick follow up
                    editMoneyRequest({
                        amount,
                        currency: transactionCurrency,
                    });
                }}
            />
        );
    }

    return null;
}

EditRequestPage.displayName = 'EditRequestPage';
EditRequestPage.propTypes = propTypes;
EditRequestPage.defaultProps = defaultProps;
export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`,
    },
})(EditRequestPage);
