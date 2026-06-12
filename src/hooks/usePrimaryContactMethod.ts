import {emailSelector} from '@selectors/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function usePrimaryContactMethod(): string {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    return account?.primaryLogin ?? sessionEmail ?? '';
}

export default usePrimaryContactMethod;
