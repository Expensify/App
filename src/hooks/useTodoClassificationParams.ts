/**
 * Reads the live Onyx data the to-do classification in TodosUtils needs, so every caller classifies reports the same way.
 */
import type {CreateTodosReportsAndTransactionsParams} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

import {useAllPersonalDetailsWithoutSnapshots} from './usePersonalDetails';

function useTodoClassificationParams(): CreateTodosReportsAndTransactionsParams {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    // The derived value exists once transactions have loaded, even when there are none, unlike the collection itself
    const [areTransactionsLoaded = false] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {selector: (data) => data !== undefined});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList] = useAllPersonalDetailsWithoutSnapshots();
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    return {
        allReports,
        allTransactions,
        allPolicies,
        allReportNameValuePairs,
        allReportActions,
        allReportMetadata,
        personalDetailsList,
        bankAccountList,
        currentUserAccountID,
        login: personalDetailsList?.[currentUserAccountID]?.login ?? session?.email ?? '',
        areTransactionsLoaded,
        rules,
    };
}

export default useTodoClassificationParams;
