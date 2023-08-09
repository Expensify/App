import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
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
    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const transactionID = lodashGet(parentReportAction, 'originalMessage.IOUTransactionID', '');
    const transaction = TransactionUtils.getTransaction(transactionID);
    const transactionDescription = TransactionUtils.getDescription(transaction);
    const transactionAmount = TransactionUtils.getAmount(transaction);
    const transactionCurrency = TransactionUtils.getCurrency(transaction);
    const transactionCreated = TransactionUtils.getCreated(transaction);
    const field = lodashGet(route, ['params', 'field'], '');
    function editTransaction(transactionChanges) {
        // Update the transaction...
        // eslint-disable-next-line no-console
        console.log({transactionChanges});

        IOU.editMoneyRequest(transactionID, report.reportID, transactionChanges);

        // Note: The "modal" we are dismissing is the MoneyRequestAmountPage
        Navigation.dismissModal();
    }

    if (field === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
                    editTransaction(transactionChanges);
                }}
            />
        );
    }

    if (field === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={transactionCreated}
                onSubmit={(transactionChanges) => {
                    editTransaction(transactionChanges);
                }}
            />
        );
    }

    if (field === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount}
                defaultCurrency={transactionCurrency}
                reportID={report.reportID}
                onSubmit={(transactionChanges) => {
                    editTransaction({
                        'amount': CurrencyUtils.convertToSmallestUnit(transactionCurrency, Number.parseFloat(transactionChanges)),
                        'currency': transactionCurrency,
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
