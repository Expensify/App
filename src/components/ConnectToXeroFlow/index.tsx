import React, {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import Navigation from '@libs/Navigation/Navigation';
import {useAccountingContext} from '@pages/workspace/accounting/AccountingContext';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect, shouldStartIntegrationFlow}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth;

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    const {startIntegrationFlow} = useAccountingContext();

    useEffect(() => {
        if (!shouldStartIntegrationFlow) {
            return;
        }

        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }

        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }
        Link.openLink(getXeroSetupLink(policyID), environmentURL);
        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.XERO, shouldStartIntegrationFlow: false});
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldStartIntegrationFlow]);

    return (
        <>
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <AccountingConnectionConfirmationModal
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        Link.openLink(getXeroSetupLink(policyID), environmentURL);
                        setIsDisconnectModalOpen(false);
                        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, shouldStartIntegrationFlow: false});
                    }}
                    integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.XERO}
                    onCancel={() => {
                        setIsDisconnectModalOpen(false);
                        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, shouldStartIntegrationFlow: false});
                    }}
                />
            )}
            {isRequire2FAModalOpen && (
                <RequireTwoFactorAuthenticationModal
                    onSubmit={() => {
                        setIsRequire2FAModalOpen(false);
                        Navigation.dismissModal();
                        Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.POLICY_ACCOUNTING.getRoute(policyID), getXeroSetupLink(policyID)));
                        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, shouldStartIntegrationFlow: false});
                    }}
                    onCancel={() => {
                        setIsRequire2FAModalOpen(false);
                        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, shouldStartIntegrationFlow: false});
                    }}
                    isVisible
                    description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
                />
            )}
        </>
    );
}

export default ConnectToXeroFlow;
