import React, {useEffect, useState} from 'react';
import PopoverMenu from '@components/PopoverMenu';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {useAccountingState} from '@pages/workspace/accounting/AccountingContext';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ConnectToCertiniaFlowProps = {
    policyID: string;
};

function ConnectToCertiniaFlow({policyID}: ConnectToCertiniaFlowProps) {
    const {translate} = useLocalize();

    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isReuseConnectionsPopoverOpen, setIsReuseConnectionsPopoverOpen] = useState(false);
    const [reuseConnectionPopoverPosition, setReuseConnectionPopoverPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const {popoverAnchorRefs} = useAccountingState();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'LinkCopy']);
    const isAuthError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.CERTINIA);

    const threeDotsMenuContainerRef = popoverAnchorRefs?.current?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA];

    const connectionOptions = [
        {
            icon: icons.LinkCopy,
            text: translate('workspace.certinia.prerequisites.connectButton'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: icons.Copy,
            text: translate('workspace.common.reuseExistingConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_EXISTING_CONNECTIONS.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];

    useEffect(() => {
        if (isAuthError || !hasReusablePoliciesConnectedToCertinia) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(policyID));
            return;
        }
        setIsReuseConnectionsPopoverOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (threeDotsMenuContainerRef) {
        if (!isSmallScreenWidth) {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                const horizontal = x + width;
                const vertical = y + height;
                if (reuseConnectionPopoverPosition.horizontal !== horizontal || reuseConnectionPopoverPosition.vertical !== vertical) {
                    setReuseConnectionPopoverPosition({horizontal, vertical});
                }
            });
        }

        return (
            <PopoverMenu
                isVisible={isReuseConnectionsPopoverOpen}
                onClose={() => {
                    setIsReuseConnectionsPopoverOpen(false);
                }}
                menuItems={connectionOptions}
                onItemSelected={(item) => {
                    if (!item?.onSelected) {
                        return;
                    }
                    item.onSelected();
                }}
                anchorPosition={reuseConnectionPopoverPosition}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                anchorRef={threeDotsMenuContainerRef}
            />
        );
    }

    return null;
}

export default ConnectToCertiniaFlow;
