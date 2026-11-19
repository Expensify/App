import {clearWiseIntroReadBankAccountID, openReimbursementAccountPageForWiseIntro} from '@userActions/WiseOnboarding';

import {useEffect} from 'react';

/** Reads the business details for the Wise onboarding form whenever `shouldRead` turns true, so the form can open without waiting for them. */
function useOpenReimbursementAccountPageForWiseIntro(bankAccountID: number, shouldRead: boolean) {
    useEffect(() => {
        if (!shouldRead) {
            return;
        }
        openReimbursementAccountPageForWiseIntro(bankAccountID);
    }, [bankAccountID, shouldRead]);

    useEffect(() => clearWiseIntroReadBankAccountID, []);
}

export default useOpenReimbursementAccountPageForWiseIntro;
