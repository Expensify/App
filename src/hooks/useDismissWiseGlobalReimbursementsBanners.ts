import {dismissWiseGlobalReimbursementsBanners} from '@userActions/WiseOnboarding';

import {useEffect} from 'react';

/** Dismisses the Wallet and Workspace banners that promote Wise global reimbursements once `shouldDismiss` turns true. */
function useDismissWiseGlobalReimbursementsBanners(shouldDismiss: boolean) {
    useEffect(() => {
        if (!shouldDismiss) {
            return;
        }
        dismissWiseGlobalReimbursementsBanners();
    }, [shouldDismiss]);
}

export default useDismissWiseGlobalReimbursementsBanners;
