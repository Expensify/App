import React, {useEffect, useState} from 'react';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openLink} from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth;
    const isUserValidated = account?.validated;

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        openLink(getXeroSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    close(() => {
                        if (isUserValidated) {
                            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path));
                            return;
                        }
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path));
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
}

export default ConnectToXeroFlow;
