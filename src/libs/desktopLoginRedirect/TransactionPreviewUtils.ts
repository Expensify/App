import type {OnyxEntry} from 'react-native-onyx';
import {getOriginalMessage, getReportAction, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {compareDuplicateTransactionFields} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {abandonReviewDuplicateTransactions, setReviewDuplicatesKey} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails, PersonalDetailsList, Report, Transaction} from '@src/types/onyx';

const emptyPersonalDetails: PersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

const chooseIdBasedOnAmount = (amount: number, negativeId: number, positiveId: number) => (amount < 0 ? negativeId : positiveId);

function getIOUData(managerID: number, ownerAccountID: number, reportID: string | undefined, personalDetails: PersonalDetailsList | undefined, amount: number) {
    const fromID = chooseIdBasedOnAmount(amount, managerID, ownerAccountID);
    const toID = chooseIdBasedOnAmount(amount, ownerAccountID, managerID);

    return {
        from: personalDetails ? personalDetails[fromID] : emptyPersonalDetails,
        to: personalDetails ? personalDetails[toID] : emptyPersonalDetails,
        isIOU: reportID ? isIOUReport(reportID) : false,
    };
}

const navigateToReviewFields = (
    route: PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, 'Transaction_Duplicate_Review'>,
    report: OnyxEntry<Report>,
    transaction: OnyxEntry<Transaction>,
    duplicates: string[],
) => {
    const backTo = route.params.backTo;

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const reviewingTransactionID = isMoneyRequestActionReportActionsUtils(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    // Clear the draft before selecting a different expense to prevent merging fields from the previous expense
    // (e.g., category, tag, tax) that may be not enabled/available in the new expense's policy.
    abandonReviewDuplicateTransactions();
    const comparisonResult = compareDuplicateTransactionFields(reviewingTransactionID, transaction?.reportID, transaction?.transactionID ?? reviewingTransactionID);
    setReviewDuplicatesKey({...comparisonResult.keep, duplicates, transactionID: transaction?.transactionID, reportID: transaction?.reportID});

    if ('merchant' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('category' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('tag' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('description' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('taxCode' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('billable' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('reimbursable' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(route.params?.threadReportID, backTo));
    }
};

export {navigateToReviewFields, getIOUData};
