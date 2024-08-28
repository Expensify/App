import React, {useEffect, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getAdminPoliciesConnectedToSageIntacct} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {useAccountingContext} from '@pages/workspace/accounting/AccountingContext';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ConnectToSageIntacctFlowProps = {
    policyID: string;
};

function ConnectToSageIntacctFlow({policyID}: ConnectToSageIntacctFlowProps) {
    const {translate} = useLocalize();

    const hasPoliciesConnectedToSageIntacct = !!getAdminPoliciesConnectedToSageIntacct().length;
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isReuseConnectionsPopoverOpen, setIsReuseConnectionsPopoverOpen] = useState(false);
    const [reuseConnectionPopoverPosition, setReuseConnectionPopoverPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const {popoverAnchorRefs} = useAccountingContext();
    const threeDotsMenuContainerRef = popoverAnchorRefs?.current?.[CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT];

    const connectionOptions = [
        {
            icon: Expensicons.LinkCopy,
            text: translate('workspace.common.createNewConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: Expensicons.Copy,
            text: translate('workspace.common.reuseExistingConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];

    useEffect(() => {
        if (!hasPoliciesConnectedToSageIntacct) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
            return;
        }
        setIsReuseConnectionsPopoverOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (threeDotsMenuContainerRef) {
        if (!isSmallScreenWidth) {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                setReuseConnectionPopoverPosition({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        }

        return (
            <PopoverMenu
                isVisible={isReuseConnectionsPopoverOpen}
                onClose={() => {
                    setIsReuseConnectionsPopoverOpen(false);
                }}
                withoutOverlay
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
}

export default ConnectToSageIntacctFlow;
