import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';

import useLocalize from '@hooks/useLocalize';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect, useState} from 'react';

import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();

    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    Navigation.navigate(getTwoFactorAuthRoute());
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
