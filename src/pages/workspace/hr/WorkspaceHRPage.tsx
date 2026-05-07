import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToGustoFlow from '@components/ConnectToGustoFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {isConnectionInProgress, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {openPolicyHRPage} from '@libs/actions/PolicyConnections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getIntegrationLastSuccessfulDate, isGustoConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceHRPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;
type GustoApprovalMode = ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>;

function WorkspaceHRPage({
    route: {
        params: {policyID},
    },
}: WorkspaceHRPageProps) {
    const {translate, datetimeToRelative, getLocalDateFromDatetime} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const [activeGustoFlowKey, setActiveGustoFlowKey] = useState<number>();
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'Sync', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);
    const gustoConnection = policy?.connections?.gusto;
    const gustoConfig = gustoConnection?.config;
    const isConnected = isGustoConnected(policy);
    const isGustoSyncInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO && isConnectionInProgress(connectionSyncProgress, policy);
    const stageInProgress = connectionSyncProgress?.stageInProgress;
    const successfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        gustoConnection,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress : undefined,
    );
    const hasGustoSyncError = !isGustoSyncInProgress && gustoConnection?.lastSync?.isSuccessful === false && !!gustoConnection?.lastSync?.errorDate;
    const lastSyncErrorMessage = hasGustoSyncError ? (gustoConnection?.lastSync?.errorMessage ?? translate('workspace.hr.gusto.syncError')) : undefined;
    const connectionDescription = useMemo(() => {
        if (isGustoSyncInProgress && stageInProgress) {
            return translate('workspace.hr.syncStageName', {stage: stageInProgress});
        }

        if (successfulDate && !lastSyncErrorMessage) {
            return translate('workspace.hr.gusto.lastSync', datetimeToRelative(successfulDate));
        }

        return undefined;
    }, [datetimeToRelative, isGustoSyncInProgress, lastSyncErrorMessage, stageInProgress, successfulDate, translate]);

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    const fetchPolicyHRPage = useCallback(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPolicyHRPage});

    useEffect(() => {
        fetchPolicyHRPage();
    }, [fetchPolicyHRPage]);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: icons.Sync,
                text: translate('workspace.hr.gusto.syncNow'),
                onSelected: () => syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO),
                disabled: isOffline,
            },
            {
                icon: icons.Trashcan,
                text: translate('workspace.hr.gusto.disconnect'),
                onSelected: () => setIsDisconnectModalOpen(true),
                shouldCallAfterModalHide: true,
            },
        ],
        [icons.Sync, icons.Trashcan, isOffline, policy, translate],
    );
    const getGustoApprovalModeLabel = (approvalMode?: GustoApprovalMode | null) => {
        if (!approvalMode) {
            return translate('workspace.hr.gusto.notSet');
        }

        switch (approvalMode) {
            case CONST.GUSTO.APPROVAL_MODE.BASIC:
                return translate('workspace.hr.gusto.approvalModes.basic.label');
            case CONST.GUSTO.APPROVAL_MODE.MANAGER:
                return translate('workspace.hr.gusto.approvalModes.manager.label');
            case CONST.GUSTO.APPROVAL_MODE.CUSTOM:
                return translate('workspace.hr.gusto.approvalModes.custom.label');
            default:
                return translate('workspace.hr.gusto.notSet');
        }
    };
    let gustoRowRightComponent;
    if (!isConnected) {
        gustoRowRightComponent = (
            <Button
                small
                text={translate('workspace.hr.gusto.connect')}
                onPress={() => setActiveGustoFlowKey(Math.random())}
            />
        );
    } else if (isGustoSyncInProgress) {
        gustoRowRightComponent = (
            <ActivityIndicator
                style={[styles.popoverMenuIcon]}
                reasonAttributes={{context: 'WorkspaceHRPage.gustoSync'}}
            />
        );
    } else {
        gustoRowRightComponent = (
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={overflowMenu}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
        );
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GUSTO)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="WorkspaceHRPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                {!!activeGustoFlowKey && (
                    <ConnectToGustoFlow
                        key={activeGustoFlowKey}
                        policyID={policyID}
                    />
                )}
                <HeaderWithBackButton
                    icon={illustrations.NewUser}
                    title={translate('workspace.common.hr')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            contentPaddingOnLargeScreens={{padding: 24}}
                            isCentralPane
                            renderTitle={() => <Text style={[styles.textStrong]}>{translate('workspace.accounting.title')}</Text>}
                        >
                            <MenuItem
                                title={translate('workspace.hr.gusto.title')}
                                icon={icons.GustoSquare}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                wrapperStyle={[styles.ph0, styles.pv2, styles.mt4, !!lastSyncErrorMessage && styles.pb0]}
                                interactive={false}
                                description={connectionDescription}
                                errorText={lastSyncErrorMessage}
                                errorTextStyle={[styles.mt5]}
                                shouldShowRedDotIndicator
                                shouldShowRightComponent
                                rightComponent={gustoRowRightComponent}
                            />
                            {isConnected && (
                                <OfflineWithFeedback pendingAction={gustoConfig?.pendingFields?.approvalMode}>
                                    <MenuItemWithTopDescription
                                        description={translate('workspace.hr.gusto.approvalMode')}
                                        title={getGustoApprovalModeLabel(gustoConfig?.approvalMode)}
                                        style={[styles.sectionMenuItemTopDescription, styles.mt2]}
                                        shouldShowRightIcon
                                        brickRoadIndicator={gustoConfig?.errorFields?.approvalMode ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE.getRoute(policyID))}
                                    />
                                </OfflineWithFeedback>
                            )}
                        </Section>
                    </View>
                </ScrollView>
                <ConfirmModal
                    title={translate('workspace.hr.gusto.disconnectTitle')}
                    isVisible={isDisconnectModalOpen}
                    onConfirm={() => {
                        if (policy) {
                            removePolicyConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO);
                        }
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.hr.gusto.disconnectPrompt')}
                    confirmText={translate('workspace.hr.gusto.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceHRPage;
