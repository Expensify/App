import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {getPoliciesConnectedToSageIntacct} from '@libs/PolicyUtils';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToSageIntacctButtonProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

function ConnectToSageIntacctButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToSageIntacctButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentIntegration = translate('workspace.accounting.integrationName', integrationToDisconnect);
    const integrationToConnect = translate('workspace.accounting.integrationName', CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const hasPoliciesConnectedToSageIntacct = !!getPoliciesConnectedToSageIntacct(policies).length;
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isReuseConnectionsPopoverOpen, setIsReuseConnectionsPopoverOpen] = useState(false);
    const [reuseConnectionPopoverPosition, setReuseConnectionPopoverPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef<View>(null);
    const connectionOptions = [
        {
            icon: Expensicons.LinkCopy,
            text: translate('workspace.intacct.createNewConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: Expensicons.Copy,
            text: translate('workspace.intacct.reuseExitingConnection'),
            onSelected: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];

    return (
        <>
            <Button
                onPress={() => {
                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    if (!hasPoliciesConnectedToSageIntacct) {
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
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
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', currentIntegration)}
                    isVisible
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        setIsDisconnectModalOpen(false);
                        if (!hasPoliciesConnectedToSageIntacct) {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
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
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', currentIntegration, integrationToConnect)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default ConnectToSageIntacctButton;
