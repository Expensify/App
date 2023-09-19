import {useEffect, useContext} from 'react';
import _ from 'underscore';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import {NetworkContext} from '../components/OnyxProvider';

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
