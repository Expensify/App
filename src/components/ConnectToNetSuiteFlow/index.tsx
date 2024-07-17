import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {removePolicyConnection} from '@libs/actions/connections';
import {getAdminPoliciesConnectedToNetSuite} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectToNetSuiteFlowProps} from './types';

function ConnectToNetSuiteFlow({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteFlowProps) {
    const {translate} = useLocalize();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    const hasPoliciesConnectedToNetSuite = !!getAdminPoliciesConnectedToNetSuite()?.length;
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isReuseConnectionsPopoverOpen, setIsReuseConnectionsPopoverOpen] = useState(false);
    const [reuseConnectionPopoverPosition, setReuseConnectionPopoverPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef<View>(null);
    const connectionOptions = [
        {
            icon: Expensicons.LinkCopy,
            text: translate('workspace.common.createNewConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: Expensicons.Copy,
            text: translate('workspace.common.reuseExistingConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }

        if (!hasPoliciesConnectedToNetSuite) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
            return;
        }

        if (!isSmallScreenWidth) {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                setReuseConnectionPopoverPosition({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        }
        setIsReuseConnectionsPopoverOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
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
                // TODO: Add anchorRef
                anchorRef={threeDotsMenuContainerRef}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <AccountingConnectionConfirmationModal
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        setIsDisconnectModalOpen(false);

                        if (!hasPoliciesConnectedToNetSuite) {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
                            return;
                        }
                        if (!isSmallScreenWidth) {
                            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                                setReuseConnectionPopoverPosition({
                                    horizontal: x + width,
                                    vertical: y + height,
                                });
                            });
                        }
                        setIsReuseConnectionsPopoverOpen(true);
                    }}
                    integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                />
            )}
        </>
    );
}

export default ConnectToNetSuiteFlow;
