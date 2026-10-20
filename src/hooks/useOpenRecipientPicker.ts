import {openRecipientPicker} from '@userActions/Report';

import {useEffect} from 'react';

import useNetwork from './useNetwork';

/** Loads policy expense chats for workspace pickers, retrying on reconnect since offline reads are dropped. */
function useOpenRecipientPicker(shouldSkip = false) {
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (shouldSkip || isOffline) {
            return;
        }
        openRecipientPicker();
    }, [shouldSkip, isOffline]);
}

export default useOpenRecipientPicker;
