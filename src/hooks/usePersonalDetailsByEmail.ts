import lodashMapKeys from 'lodash/mapKeys';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Subscribes to all personal details and remaps them by email (login) instead of account ID.
 * Unlike passing a selector directly to useOnyx (which triggers expensive deepEqual
 * comparisons on the entire mapped collection), this hook lets Onyx use cheap
 * shallowEqual on raw personal detail references, then remaps inline.
 */
function usePersonalDetailsByEmail() {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const result = personalDetails ? lodashMapKeys(personalDetails, (value, key) => value?.login ?? key) : undefined;

    return result;
}

export default usePersonalDetailsByEmail;
