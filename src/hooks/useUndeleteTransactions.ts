import {changeTransactionsReport} from '@libs/actions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useUndeleteTransactions() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    return (transactions: Transaction[]) => {
        const transactionIDs = transactions.map((transaction) => transaction.transactionID);

        changeTransactionsReport({
            transactionIDs,
            isASAPSubmitBetaEnabled,
            accountID: currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: currentUserPersonalDetails.email ?? '',
            policy,
            policyTagList,
            transactions,
            transactionViolations,
        });
    };
}

export default useUndeleteTransactions;
