import React from 'react';
import {useNetwork} from '@hooks/useNetwork';
import Button from './Button';
import * as CertiniaActions from '@libs/actions/Certinia';
import {translateLocal} from '@libs/Localize';
import type {WithCurrentUserPersonalDetailsProps} from './withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';

type ConnectToCertiniaProps = WithCurrentUserPersonalDetailsProps & {
    /** Callback to close the modal */
    onClose?: () => void;
};

function ConnectToCertinia({onClose, currentUserPersonalDetails}: ConnectToCertiniaProps) {
    const {isOffline} = useNetwork();

    // The issue is that the button was hidden when offline.
    // We should allow the user to click the button even when offline.
    // The action handler (CertiniaActions.connect) should handle the offline state
    // by queuing the request or showing a local confirmation.
    
    const handleConnect = () => {
        // Even if offline, we might want to show a modal or queue the action.
        // For now, we simply call the action which should handle offline logic internally.
        CertiniaActions.connect();
    };

    return (
        <Button
            text={translateLocal('certinia.connect')}
            onPress={handleConnect}
            // Removed the condition that hid the button when offline
            // Previously: isDisabled={isOffline} or style={{display: isOffline ? 'none' : 'flex'}}
            // Now: The button is always visible.
            isDisabled={false} 
            style={[isOffline ? {} : {}]} // Optional: Add visual cue for offline if needed, but don't hide
        />
    );
}

export default withCurrentUserPersonalDetails(ConnectToCertinia);