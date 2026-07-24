import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

import React, {useEffect, useState} from 'react';

import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        // On web the setup opens OldDot in a new browser tab. Open it inline here (within the connect click's
        // user-gesture window) instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
        openLink(getXeroSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    close(() => {
                        Navigation.navigate(getTwoFactorAuthRoute());
                    });
                }}
                onCancel={() => {
                    setIsRequire2FAModalOpen(false);
                }}
                isVisible={isRequire2FAModalOpen}
                description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
            />
        );
    }

    return null;
}

export default ConnectToXeroFlow;
