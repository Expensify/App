import {changeTransactionsReport} from '@libs/actions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useAllTransactions from './useAllTransactions';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useUndeleteTransactions() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const allTransactions = useAllTransactions();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {translate, toLocaleDigit} = useLocalize();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`);

    return (transactionIDs: string[]) => {
        changeTransactionsReport({
            transactionIDs,
            isASAPSubmitBetaEnabled,
            accountID: currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: currentUserPersonalDetails.email ?? '',
            policy,
            allTransactions,
            translate,
            toLocaleDigit,
        });
    };
}

export default useUndeleteTransactions;
