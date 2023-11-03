import {useContext, useEffect} from 'react';
import _ from 'underscore';
import {NetworkContext} from '@components/OnyxProvider';
import * as PersonalDetails from '@userActions/PersonalDetails';

/**
 * Hook for fetching private personal details
 */
export default function usePrivatePersonalDetails() {
    const {isOffline} = useContext(NetworkContext);

    useEffect(() => {
        const personalDetails = PersonalDetails.getPrivatePersonalDetails();
        if (isOffline || (Boolean(personalDetails) && !_.isUndefined(personalDetails.isLoading))) {
            return;
        }
        PersonalDetails.openPersonalDetailsPage();
    }, [isOffline]);
}
