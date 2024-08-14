import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {removePolicyConnection} from '@libs/actions/connections';
import {getAdminPoliciesConnectedToNetSuite} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectToNetSuiteButtonProps} from './types';

function ConnectToNetSuiteButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);

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

    return (
        <>
            <Button
                onPress={() => {
                    if (!isControlPolicy(policy)) {
                        Navigation.navigate(
                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.netsuite.alias, ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID)),
                        );
                        return;
                    }

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
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
                ref={threeDotsMenuContainerRef}
            />
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

export default ConnectToNetSuiteButton;
