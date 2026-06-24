import createTodosReportsAndTransactions from '@libs/TodosUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.TODOS,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.BANK_ACCOUNT_LIST,
        ONYXKEYS.SESSION,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
    ],
    compute: ([allReports, allPolicies, allReportNameValuePairs, allTransactions, allReportActions, allReportMetadata, bankAccountList, session, personalDetailsList]) => {
        const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';

        const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID} = createTodosReportsAndTransactions({
            allReports,
            allTransactions,
            allPolicies,
            allReportNameValuePairs,
            allReportActions,
            allReportMetadata,
            bankAccountList,
            currentUserAccountID: userAccountID,
            login,
        });

        return {
            reportsToSubmit,
            reportsToApprove,
            reportsToPay,
            reportsToExport,
            transactionsByReportID,
        };
    },
});
