import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import transactionPropTypes from '@components/transactionPropTypes';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestMerchantPage from './EditRequestMerchantPage';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The transaction field we are editing */
            field: PropTypes.string,

            /** The chat reportID of the split */
            reportID: PropTypes.string,

            /** reportActionID of the split action */
            reportActionID: PropTypes.string,
        }),
    }).isRequired,

    /** The current transaction */
    transaction: transactionPropTypes.isRequired,

    /** The draft transaction that holds data to be persisted on the current transaction */
    draftTransaction: transactionPropTypes,
};

const defaultProps = {
    draftTransaction: undefined,
};

function EditSplitBillPage({route, transaction, draftTransaction}) {
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');
    const reportID = lodashGet(route, ['params', 'reportID'], '');
    const reportActionID = lodashGet(route, ['params', 'reportActionID'], '');

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        created: transactionCreated,
    } = draftTransaction ? ReportUtils.getTransactionDetails(draftTransaction) : ReportUtils.getTransactionDetails(transaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;

    function navigateBackToSplitDetails() {
        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(reportID, reportActionID));
    }

    function setDraftSplitTransaction(transactionChanges) {
        IOU.setDraftSplitTransaction(transaction.transactionID, transactionChanges);
        navigateBackToSplitDetails();
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
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

                    setDraftSplitTransaction({
                        amount,
                        currency: defaultCurrency,
                    });
                }}
                onNavigateToCurrency={() => {
                    const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
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
                    setDraftSplitTransaction({merchant: transactionChanges.merchant.trim()});
                }}
            />
        );
    }

    return <FullPageNotFoundView shouldShow />;
}

EditSplitBillPage.displayName = 'EditSplitBillPage';
EditSplitBillPage.propTypes = propTypes;
EditSplitBillPage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
            canEvict: false,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        transaction: {
            key: ({route, reportActions}) => {
                const reportAction = reportActions[`${route.params.reportActionID.toString()}`];
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(reportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
        draftTransaction: {
            key: ({route, reportActions}) => {
                const reportAction = reportActions[`${route.params.reportActionID.toString()}`];
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${lodashGet(reportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
    }),
)(EditSplitBillPage);
