/** Reads an integration's account-wide waitlist signup, with its queued action and errors. */
import useOnyx from '@hooks/useOnyx';

import {getIntegrationWaitlistField, getIntegrationWaitlistNVPKey} from '@libs/IntegrationWaitlistUtils';
import type {WaitlistIntegration} from '@libs/IntegrationWaitlistUtils';

import ONYXKEYS from '@src/ONYXKEYS';

function useIntegrationWaitlist(integration: WaitlistIntegration) {
    const field = getIntegrationWaitlistField(integration);
    const [signupTimestamp] = useOnyx(getIntegrationWaitlistNVPKey(integration));
    const [pendingAction] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.pendingFields?.[field]});
    const [errors] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.errorFields?.[field]});

    return {signupTimestamp, pendingAction, errors};
}

export default useIntegrationWaitlist;
