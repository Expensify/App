import PopoverMenu from '@components/PopoverMenu';

import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import {useAccountingState} from '@pages/workspace/accounting/AccountingContext';

import type {AnchorPosition} from '@styles/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useEffect, useLayoutEffect, useState} from 'react';

type ConnectToCertiniaFlowProps = {
    policyID: string;
};

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function ConnectToCertiniaFlow({policyID}: ConnectToCertiniaFlowProps) {
    const {translate} = useLocalize();

    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);

    const [isConnectionOptionsPopoverOpen, setIsConnectionOptionsPopoverOpen] = useState(false);
    const [connectionOptionsPopoverPosition, setConnectionOptionsPopoverPosition] = useState<AnchorPosition | null>(null);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const isAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.CERTINIA);

    const {popoverAnchorRefs} = useAccountingState();
    const threeDotsMenuContainerRef = popoverAnchorRefs?.current?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA];

    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'LinkCopy']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const connectionOptions = [
        {
            icon: icons.LinkCopy,
            text: translate('workspace.certinia.prerequisites.connectButton'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID));
                setIsConnectionOptionsPopoverOpen(false);
            },
        },
        {
            icon: icons.LinkCopy,
            text: translate('workspace.certinia.prerequisites.connectSandboxButton'),
            onSelected: () => {
                const isSandbox = true;
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID, CONST.CERTINIA_PREREQUISITES.PAGE_NAME.INSTALL_BUNDLE, isSandbox));
                setIsConnectionOptionsPopoverOpen(false);
            },
        },
        ...(hasReusablePoliciesConnectedToCertinia
            ? [
                  {
                      icon: icons.Copy,
                      text: translate('workspace.common.reuseExistingConnection'),
                      onSelected: () => {
                          Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_EXISTING_CONNECTIONS.getRoute(policyID));
                          setIsConnectionOptionsPopoverOpen(false);
                      },
                  },
              ]
            : []),
    ];

    useEffect(() => {
        if (!isAuthError) {
            // We could ignore the lint error here because this effect has no dependencies, and would only run once.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsConnectionOptionsPopoverOpen(true);
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        if (!isConnectionOptionsPopoverOpen) {
            return;
        }

        calculatePopoverPosition(threeDotsMenuContainerRef, anchorAlignment).then(setConnectionOptionsPopoverPosition);
    }, [isConnectionOptionsPopoverOpen, calculatePopoverPosition, threeDotsMenuContainerRef]);

    if (!connectionOptionsPopoverPosition) {
        return null;
    }

    return (
        <PopoverMenu
            isVisible={isConnectionOptionsPopoverOpen}
            onClose={() => {
                setIsConnectionOptionsPopoverOpen(false);
            }}
            menuItems={connectionOptions}
            onItemSelected={(item) => {
                if (!item?.onSelected) {
                    return;
                }
                item.onSelected();
            }}
            anchorPosition={connectionOptionsPopoverPosition}
            anchorAlignment={anchorAlignment}
            anchorRef={threeDotsMenuContainerRef}
        />
    );
}

export default ConnectToCertiniaFlow;
