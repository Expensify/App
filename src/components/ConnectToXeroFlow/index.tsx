import React, {useEffect, useState} from 'react';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {openLink} from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
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
                        const backTo = ROUTES.POLICY_ACCOUNTING.getRoute(policyID);
                        const validatedUserForwardTo = getXeroSetupLink(policyID);
                        if (isUserValidated) {
                            Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(backTo, validatedUserForwardTo));
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute({
                                backTo,
                                forwardTo: ROUTES.SETTINGS_2FA_ROOT.getRoute(backTo, validatedUserForwardTo),
                            }),
                        );
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
