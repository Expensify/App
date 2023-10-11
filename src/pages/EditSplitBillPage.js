import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';
import ONYXKEYS from '../ONYXKEYS';
import reportPropTypes from './reportPropTypes';
import transactionPropTypes from '../components/transactionPropTypes';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestMerchantPage from './EditRequestMerchantPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestAmountPage from './EditRequestAmountPage';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** The chat reportID of the split */
            reportID: PropTypes.string,

            /** reportActionID of the split action */
            reportActionID: PropTypes.string,
        }),
    }).isRequired,

    /** All the transactions */
    transactions: PropTypes.shape(transactionPropTypes),

    /** Used for retrieving the draft transaction of the split bill being edited */
    draftSplitTransactions: PropTypes.shape(transactionPropTypes),
};

const defaultProps = {
    draftSplitTransactions: {},
    transactions: {},
};

function EditSplitBillPage({route, reportActions, transactions, draftSplitTransactions}) {
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');
    const reportID = lodashGet(route, ['params', 'reportID'], '');
    const reportActionID = lodashGet(route, ['params', 'reportActionID'], '');
    const transactionID = lodashGet(reportActions[reportActionID], 'originalMessage.IOUTransactionID', 0);
    const transaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

    let draftSplitTransaction = draftSplitTransactions[`${ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION}${transactionID}`];
    if (!draftSplitTransaction) {
        IOU.setDraftSplitTransaction(transactionID);
    }

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        created: transactionCreated,
    } = draftSplitTransaction ? ReportUtils.getTransactionDetails(draftSplitTransaction) : ReportUtils.getTransactionDetails(transaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;

    function setDraftSplitTransaction(transactionChanges) {
        IOU.setDraftSplitTransaction(transactionID, transactionChanges);
        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(reportID, reportActionID));
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
                    if (transactionChanges.comment.trim() === transactionDescription) {
                        Navigation.dismissModal();
                        return;
                    }
                    setDraftSplitTransaction({
                        comment: transactionChanges.comment.trim(),
                    });
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={transactionCreated}
                defaultAmount={transactionAmount}
                reportID={reportID}
                onSubmit={(transactionChanges) => {
                    if (transactionChanges.created === transactionCreated) {
                        Navigation.dismissModal();
                        return;
                    }
                    setDraftSplitTransaction({
                        created: transactionChanges.created,
                    });
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount}
                defaultCurrency={defaultCurrency}
                reportID={reportID}
                isEdittingSplitBill
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges));

                    if (amount === transactionAmount && transactionCurrency === defaultCurrency) {
                        Navigation.goBack();
                        return;
                    }

                    setDraftSplitTransaction({
                        amount,
                        currency: defaultCurrency,
                    });
                }}
                onNavigateToCurrency={() => {
                    const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL_CURRENCY.getRoute(reportID, reportActionID, defaultCurrency, activeRoute));
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.MERCHANT) {
        return (
            <EditRequestMerchantPage
                defaultMerchant={transactionMerchant}
                onSubmit={(transactionChanges) => {
                    if (transactionMerchant === transactionChanges.merchant) {
                        Navigation.goBack();
                        return;
                    }
                    setDraftSplitTransaction({merchant: transactionChanges.merchant});
                }}
            />
        );
    }

    return <FullPageNotFoundView shouldShow />;
}

EditSplitBillPage.displayName = 'EditSplitBillPage';
EditSplitBillPage.propTypes = propTypes;
EditSplitBillPage.defaultProps = defaultProps;
export default withOnyx({
    reportActions: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
        canEvict: false,
    },
    transactions: {
        key: ONYXKEYS.COLLECTION.TRANSACTION,
    },
    draftSplitTransactions: {
        key: ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION,
    },
})(EditSplitBillPage);
