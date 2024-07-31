import React, {useEffect, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import {useAccountingContext} from '@pages/workspace/accounting/AccountingContext';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {AnchorPosition} from '@src/styles';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';

type ConnectToIntegrationWithReconnectFeatureFlowProps = {
    hasPoliciesConnectedToIntegration: boolean;
    integrationNewConnectionRoute: Route;
    integrationExistingConnectionsRoute: Route;
};

function ConnectToIntegrationWithReconnectFeatureFlow({
    hasPoliciesConnectedToIntegration,
    integrationNewConnectionRoute,
    integrationExistingConnectionsRoute,
}: ConnectToIntegrationWithReconnectFeatureFlowProps) {
    const {translate} = useLocalize();

    const {isSmallScreenWidth} = useWindowDimensions();
    const [isReuseConnectionsPopoverOpen, setIsReuseConnectionsPopoverOpen] = useState(false);
    const [reuseConnectionPopoverPosition, setReuseConnectionPopoverPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const {activeIntegration, integrationRefs} = useAccountingContext();
    const threeDotsMenuContainerRef = integrationRefs?.current?.[activeIntegration?.name ?? '-1'];

    const connectionOptions = [
        {
            icon: Expensicons.LinkCopy,
            text: translate('workspace.common.createNewConnection'),
            onSelected: () => {
                Navigation.navigate(integrationNewConnectionRoute);
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: Expensicons.Copy,
            text: translate('workspace.common.reuseExistingConnection'),
            onSelected: () => {
                Navigation.navigate(integrationExistingConnectionsRoute);
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];

    useEffect(() => {
        if (!hasPoliciesConnectedToIntegration) {
            Navigation.navigate(integrationNewConnectionRoute);
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

export default ConnectToIntegrationWithReconnectFeatureFlow;
