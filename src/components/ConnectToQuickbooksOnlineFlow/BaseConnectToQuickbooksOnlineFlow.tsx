/**
 * Shared QuickBooks Online and Intuit Enterprise Suite connection flow.
 * Development environments can select a production or sandbox connection before starting the platform-specific flow.
 */
import PopoverMenu from '@components/PopoverMenu';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';

import {isAuthenticationError} from '@libs/actions/connections';

import {useAccountingState} from '@pages/workspace/accounting/AccountingContext';

import type {AnchorPosition} from '@styles/index';

import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

type BaseConnectToQuickbooksOnlineFlowProps = ConnectToQuickbooksOnlineFlowProps & {
    onConnect: (isSandbox: boolean) => void;
};

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function BaseConnectToQuickbooksOnlineFlow({policyID, isIntuitEnterpriseSuite, onConnect}: BaseConnectToQuickbooksOnlineFlowProps) {
    const {environment} = useEnvironment();
    const {translate} = useLocalize();
    const {popoverAnchorRefs} = useAccountingState();
    const {calculatePopoverPosition} = usePopoverPosition();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy']);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const isAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.QBO);
    const shouldShowConnectionOptions = !!isIntuitEnterpriseSuite && (environment === CONST.ENVIRONMENT.DEV || environment === CONST.ENVIRONMENT.STAGING) && !isAuthError;
    const [isConnectionOptionsPopoverOpen, setIsConnectionOptionsPopoverOpen] = useState(shouldShowConnectionOptions);
    const [connectionOptionsPopoverPosition, setConnectionOptionsPopoverPosition] = useState<AnchorPosition | null>(null);
    const didInitialize = useRef(false);
    const integrationKey = isIntuitEnterpriseSuite ? CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE : CONST.POLICY.CONNECTIONS.NAME.QBO;
    const connectionButtonRef = popoverAnchorRefs?.current?.[integrationKey];

    const selectConnection = (isSandbox: boolean) => {
        onConnect(isSandbox);
        setIsConnectionOptionsPopoverOpen(false);
    };

    useEffect(() => {
        if (didInitialize.current) {
            return;
        }
        didInitialize.current = true;

        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        // Reconnect starts from the overflow menu, so there is no connection button to anchor this popover to.
        if (!shouldShowConnectionOptions) {
            onConnect(false);
        }
    }, [onConnect, policyID, shouldShowConnectionOptions]);

    useLayoutEffect(() => {
        if (!isConnectionOptionsPopoverOpen) {
            return;
        }
        calculatePopoverPosition(connectionButtonRef, anchorAlignment).then(setConnectionOptionsPopoverPosition);
    }, [isConnectionOptionsPopoverOpen, calculatePopoverPosition, connectionButtonRef]);

    if (!connectionOptionsPopoverPosition) {
        return null;
    }

    return (
        <PopoverMenu
            isVisible={isConnectionOptionsPopoverOpen}
            onClose={() => setIsConnectionOptionsPopoverOpen(false)}
            menuItems={[
                {
                    icon: icons.LinkCopy,
                    text: translate('workspace.accounting.setup'),
                    onSelected: () => selectConnection(false),
                },
                {
                    icon: icons.LinkCopy,
                    text: translate('workspace.accounting.connectToSandbox'),
                    onSelected: () => selectConnection(true),
                },
            ]}
            anchorPosition={connectionOptionsPopoverPosition}
            anchorAlignment={anchorAlignment}
            anchorRef={connectionButtonRef}
        />
    );
}

export default BaseConnectToQuickbooksOnlineFlow;
