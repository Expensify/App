import {isUserValidatedSelector} from '@selectors/Account';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {handleUnvalidatedUserNavigation} from '@libs/SettlementButtonUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

/**
 * Guards payment actions behind authorization checks: delegate access, locked account,
 * unvalidated user, and billing restrictions. Returns a callback that performs all checks
 * and navigates away if any fail.
 */
function usePaymentGuard(chatReportID: string, reportID: string | undefined, policy: Policy | undefined) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGraceEndPeriod] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const checkForNecessaryAction = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }

        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }

        if (!isUserValidated) {
            handleUnvalidatedUserNavigation(chatReportID, reportID);
            return true;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id, userBillingGraceEndPeriods, undefined, ownerBillingGraceEndPeriod)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return true;
        }

        return false;
    };

    return {checkForNecessaryAction, userBillingGraceEndPeriods};
}

export default usePaymentGuard;
