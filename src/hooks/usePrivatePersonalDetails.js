import {useEffect, useContext} from 'react';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import {NetworkContext} from '../components/OnyxProvider';

/**
 * Hook for fetching private personal details
 */
export default function usePrivatePersonalDetails() {
    const {isOffline} = useContext(NetworkContext);

    useEffect(() => {
        if (isOffline || Boolean(PersonalDetails.getPrivatePersonalDetails())) {
            return;
        }
        PersonalDetails.openPersonalDetailsPage();
    }, [isOffline]);
}
