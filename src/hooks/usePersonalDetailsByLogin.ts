import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Hook that returns personal details indexed by login email.
 * Enables case-insensitive lookups.
 */
function usePersonalDetailsByLogin(): Record<string, PersonalDetails> {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    return useMemo(() => {
        if (!personalDetails) {
            return {};
        }

        return Object.values(personalDetails).reduce((acc: Record<string, PersonalDetails>, detail) => {
            if (detail?.login) {
                acc[detail.login.toLowerCase()] = detail;
            }
            return acc;
        }, {});
    }, [personalDetails]);
}

export default usePersonalDetailsByLogin;
