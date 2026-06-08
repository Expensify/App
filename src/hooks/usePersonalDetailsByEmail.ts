import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Subscribes to all personal details and remaps them by email (login) instead of account ID.
 * Unlike passing a selector directly to useOnyx (which triggers expensive deepEqual
 * comparisons on the entire mapped collection), this hook lets Onyx use cheap
 * shallowEqual on raw personal detail references, then remaps inline.
 */
function usePersonalDetailsByEmail() {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    if (!personalDetails) {
        return undefined;
    }

    const result: PersonalDetailsList = {};
    for (const [key, value] of Object.entries(personalDetails)) {
        result[value?.login ?? key] = value;
    }

    return result;
}

export default usePersonalDetailsByEmail;
