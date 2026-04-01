import {useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

/**
 * Hook that returns a map from accountID to login email.
 */
function useAccountIDToLogin(): Record<number, string> {
    const personalDetails = usePersonalDetails();

    return useMemo(() => {
        const map: Record<number, string> = {};
        for (const [id, details] of Object.entries(personalDetails ?? {})) {
            if (details?.login) {
                map[Number(id)] = details.login;
            }
        }
        return map;
    }, [personalDetails]);
}

export default useAccountIDToLogin;
