import {useContext, useEffect} from 'react';
import {NetworkContext} from '@components/OnyxProvider';
import * as PersonalDetails from '@userActions/PersonalDetails';

/**
 * Hook for fetching private personal details
 */
export default function usePrivatePersonalDetails() {
    const network = useContext(NetworkContext);

    useEffect(() => {
        const personalDetails = PersonalDetails.getPrivatePersonalDetails();
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (network?.isOffline || (Boolean(personalDetails) && personalDetails?.isLoading !== undefined)) {
            return;
        }

        PersonalDetails.openPersonalDetailsPage();
    }, [network?.isOffline]);
}
