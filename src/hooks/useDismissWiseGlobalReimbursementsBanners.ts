import {dismissProductTraining} from '@userActions/Welcome';

import CONST from '@src/CONST';

import {useEffect} from 'react';

/** Dismisses the Wallet and Workspace banners that promote Wise global reimbursements once `shouldDismiss` turns true. */
function useDismissWiseGlobalReimbursementsBanners(shouldDismiss: boolean) {
    useEffect(() => {
        if (!shouldDismiss) {
            return;
        }
        dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER);
        dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WORKSPACE_BANNER);
    }, [shouldDismiss]);
}

export default useDismissWiseGlobalReimbursementsBanners;
