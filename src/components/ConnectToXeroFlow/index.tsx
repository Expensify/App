import React, {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth;

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        Link.openLink(getXeroSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.POLICY_ACCOUNTING.getRoute(policyID), getXeroSetupLink(policyID)));
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
