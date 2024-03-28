import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import type {TransactionChanges} from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportActions, Transaction} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestTagPage from './EditRequestTagPage';

type EditSplitBillOnyxProps = {
    /** The report currently being used */
    report: OnyxEntry<Report>;

    /** The report action for currently used report */
    // Used in withOnyx
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: OnyxEntry<ReportActions>;

    /** The current transaction */
    transaction: OnyxEntry<Transaction>;

    /** The draft transaction that holds data to be persisted on the current transaction */
    draftTransaction: OnyxEntry<Transaction>;
};

type EditSplitBillProps = EditSplitBillOnyxProps & StackScreenProps<SplitDetailsNavigatorParamList, typeof SCREENS.SPLIT_DETAILS.EDIT_REQUEST>;

function EditSplitBillPage({route, transaction, draftTransaction, report}: EditSplitBillProps) {
    const {field: fieldToEdit, reportID, reportActionID, currency, tagIndex} = route.params;

    const {amount: transactionAmount, currency: transactionCurrency, tag: transactionTag} = ReportUtils.getTransactionDetails(draftTransaction ?? transaction) ?? {};

    const defaultCurrency = currency ?? transactionCurrency;
    function navigateBackToSplitDetails() {
        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(reportID, reportActionID));
    }

    const setDraftSplitTransaction = (transactionChanges: TransactionChanges) => {
        if (transaction) {
            IOU.setDraftSplitTransaction(transaction.transactionID, transactionChanges);
        }
        navigateBackToSplitDetails();
    };

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount ?? 0}
                defaultCurrency={defaultCurrency ?? ''}
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges.amount));

                    setDraftSplitTransaction({
                        amount,
                        currency: transactionChanges.currency,
                    });
                }}
                onNavigateToCurrency={() => {
                    const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL_CURRENCY.getRoute(reportID, reportActionID, defaultCurrency, activeRoute));
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAG) {
        return (
            <EditRequestTagPage
                defaultTag={transactionTag ?? ''}
                policyID={report?.policyID ?? ''}
                tagListIndex={Number(tagIndex)}
                onSubmit={(transactionChanges) => {
                    setDraftSplitTransaction({tag: transactionChanges.tag.trim()});
                }}
            />
        );
    }

    return <FullPageNotFoundView shouldShow />;
}

EditSplitBillPage.displayName = 'EditSplitBillPage';

export default withOnyx<EditSplitBillProps, EditSplitBillOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    reportActions: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
        canEvict: false,
    },
    transaction: {
        key: ({route, reportActions}: Partial<EditSplitBillProps>) => {
            const reportAction = reportActions?.[`${route?.params.reportActionID.toString()}`];
            const transactionID = (reportAction as OriginalMessageIOU)?.originalMessage.IOUTransactionID ? (reportAction as OriginalMessageIOU).originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
    draftTransaction: {
        key: ({route, reportActions}: Partial<EditSplitBillProps>) => {
            const reportAction = reportActions?.[`${route?.params.reportActionID.toString()}`];
            const transactionID = (reportAction as OriginalMessageIOU)?.originalMessage.IOUTransactionID ? (reportAction as OriginalMessageIOU).originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
})(EditSplitBillPage);
