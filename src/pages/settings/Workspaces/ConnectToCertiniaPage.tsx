import React from 'react';
import {useNetwork} from '@hooks/useNetwork';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import * as CertiniaActions from '@libs/actions/Certinia';
import Button from '@components/Button';
import {translateLocal} from '@libs/Localize';
import useLocalize from '@hooks/useLocalize';

function ConnectToCertiniaPage() {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const handleConnect = () => {
        // Ensure the action handles offline state (e.g., queues the request)
        CertiniaActions.connect();
    };

    return (
        <ScreenWrapper>
            <HeaderWithBackButton title={translate('certinia.connectToCertinia')} />
            
            {/* 
               FIX: The button should not be hidden when offline.
               Previously, the code might have been:
               {!isOffline && <Button ... />}
               
               Now, we render the button regardless of network status.
            */}
            <Button
                text={translate('certinia.connect')}
                onPress={handleConnect}
                // Ensure the button is enabled even if offline
                isDisabled={false} 
            />
        </ScreenWrapper>
    );
}

export default ConnectToCertiniaPage;