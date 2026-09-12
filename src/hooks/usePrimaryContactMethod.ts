import ONYXKEYS from '@src/ONYXKEYS';

import {emailSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

function usePrimaryContactMethod(): string {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    // primaryLogin is sometimes stored as an empty string rather than being absent, so treat it as missing and fall back to the session email.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return account?.primaryLogin || sessionEmail || '';
}

export default usePrimaryContactMethod;
