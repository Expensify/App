import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import CONST from '../CONST';
import ROUTES from '../ROUTES';
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
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';

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

function EditSplitBillRequestPage({report, route, draftSplitTransactions}) {
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');
    const reportAction = ReportActionsUtils.getReportAction(report.reportID, lodashGet(route, ['params', 'reportActionID'], ''));
    const transactionID = TransactionUtils.getLinkedTransaction(reportAction).transactionID;
    const draftSplitTransaction = draftSplitTransactions[`${ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION}${transactionID}`];

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        created: transactionCreated,
    } = ReportUtils.getTransactionDetails(draftSplitTransaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;

    function setDraftSplitTransaction(transactionChanges) {
        IOU.setDraftSplitTransaction(transactionID, transactionChanges);
        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(report.reportID, reportAction.reportActionID));
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
                    if (transactionChanges.comment === transactionDescription) {
                        Navigation.dismissModal();
                        return;
                    }
                    setDraftSplitTransaction({
                        comment: transactionChanges.comment,
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
                reportID={report.reportID}
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
                reportID={report.reportID}
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

EditSplitBillRequestPage.displayName = 'EditSplitBillRequestPage';
EditSplitBillRequestPage.propTypes = propTypes;
EditSplitBillRequestPage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        draftSplitTransactions: {
            key: ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION,
        },
    }),
)(EditSplitBillRequestPage);
