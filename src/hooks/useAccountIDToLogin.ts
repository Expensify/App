import {usePersonalDetails} from '@components/OnyxListItemProvider';

/**
 * Hook that returns a map from accountID to login email.
 */
function useAccountIDToLogin(): Record<number, string> {
    const personalDetails = usePersonalDetails();

    const map: Record<number, string> = {};
    for (const [id, details] of Object.entries(personalDetails ?? {})) {
        if (details?.login) {
            map[Number(id)] = details.login;
        }
    }
    return map;
}

export default useAccountIDToLogin;
