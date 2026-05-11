import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToGustoFlow from '@components/ConnectToGustoFlow';
import ConnectToZenefitsFlow from '@components/ConnectToZenefitsFlow';
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
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getIntegrationLastSuccessfulDate, isGustoConnected, isZenefitsConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceHRPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;
type GustoApprovalMode = ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>;
type ZenefitsApprovalMode = ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>;

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
    const [activeZenefitsFlowKey, setActiveZenefitsFlowKey] = useState<number>();
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [isZenefitsDisconnectModalOpen, setIsZenefitsDisconnectModalOpen] = useState(false);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'ZenefitsSquare', 'Sync', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);

    // Gusto state
    const gustoConnection = policy?.connections?.gusto;
    const gustoConfig = gustoConnection?.config;
    const isGustoConnectedState = isGustoConnected(policy);
    const isGustoSyncInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO && isConnectionInProgress(connectionSyncProgress, policy);
    const gustoStageInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress?.stageInProgress : undefined;
    const gustoSuccessfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        gustoConnection,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress : undefined,
    );
    const hasGustoSyncError = !isGustoSyncInProgress && gustoConnection?.lastSync?.isSuccessful === false && !!gustoConnection?.lastSync?.errorDate;
    const gustoLastSyncErrorMessage = hasGustoSyncError ? (gustoConnection?.lastSync?.errorMessage ?? translate('workspace.hr.gusto.syncError')) : undefined;
    const gustoConnectionDescription = useMemo(() => {
        if (isGustoSyncInProgress && gustoStageInProgress) {
            return translate('workspace.hr.syncStageName', {stage: gustoStageInProgress});
        }

        if (gustoSuccessfulDate && !gustoLastSyncErrorMessage) {
            return translate('workspace.hr.gusto.lastSync', datetimeToRelative(gustoSuccessfulDate));
        }

        return undefined;
    }, [datetimeToRelative, isGustoSyncInProgress, gustoLastSyncErrorMessage, gustoStageInProgress, gustoSuccessfulDate, translate]);

    // Zenefits (TriNet) state
    const zenefitsConnection = policy?.connections?.zenefits;
    const zenefitsConfig = zenefitsConnection?.config;
    const isZenefitsConnectedState = isZenefitsConnected(policy);
    const isZenefitsSyncInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS && isConnectionInProgress(connectionSyncProgress, policy);
    const zenefitsStageInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS ? connectionSyncProgress?.stageInProgress : undefined;
    const zenefitsSuccessfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        zenefitsConnection,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS ? connectionSyncProgress : undefined,
    );
    const hasZenefitsSyncError = !isZenefitsSyncInProgress && zenefitsConnection?.lastSync?.isSuccessful === false && !!zenefitsConnection?.lastSync?.errorDate;
    const zenefitsLastSyncErrorMessage = hasZenefitsSyncError ? (zenefitsConnection?.lastSync?.errorMessage ?? translate('workspace.hr.zenefits.syncError')) : undefined;
    const zenefitsConnectionDescription = useMemo(() => {
        if (isZenefitsSyncInProgress && zenefitsStageInProgress) {
            return translate('workspace.hr.syncStageName', {stage: zenefitsStageInProgress});
        }

        if (zenefitsSuccessfulDate && !zenefitsLastSyncErrorMessage) {
            return translate('workspace.hr.zenefits.lastSync', datetimeToRelative(zenefitsSuccessfulDate));
        }

        return undefined;
    }, [datetimeToRelative, isZenefitsSyncInProgress, zenefitsLastSyncErrorMessage, zenefitsStageInProgress, zenefitsSuccessfulDate, translate]);

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    const fetchPolicyHRPage = useCallback(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPolicyHRPage});

    useEffect(() => {
        fetchPolicyHRPage();
    }, [fetchPolicyHRPage]);

    // Gusto overflow menu
    const gustoOverflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
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

    // Zenefits overflow menu
    const zenefitsOverflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: icons.Sync,
                text: translate('workspace.hr.zenefits.syncNow'),
                onSelected: () => syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.ZENEFITS),
                disabled: isOffline,
            },
            {
                icon: icons.Trashcan,
                text: translate('workspace.hr.zenefits.disconnect'),
                onSelected: () => setIsZenefitsDisconnectModalOpen(true),
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

    const getZenefitsApprovalModeLabel = (approvalMode?: ZenefitsApprovalMode | null) => {
        if (!approvalMode) {
            return translate('workspace.hr.zenefits.notSet');
        }

        switch (approvalMode) {
            case CONST.ZENEFITS.APPROVAL_MODE.BASIC:
                return translate('workspace.hr.zenefits.approvalModes.basic.label');
            case CONST.ZENEFITS.APPROVAL_MODE.MANAGER:
                return translate('workspace.hr.zenefits.approvalModes.manager.label');
            case CONST.ZENEFITS.APPROVAL_MODE.CUSTOM:
                return translate('workspace.hr.zenefits.approvalModes.custom.label');
            default:
                return translate('workspace.hr.zenefits.notSet');
        }
    };

    const getFinalApproverDisplayName = (finalApprover?: string | null, notSetKey: 'workspace.hr.gusto.notSet' | 'workspace.hr.zenefits.notSet' = 'workspace.hr.gusto.notSet') => {
        if (!finalApprover) {
            return translate(notSetKey);
        }

        return getDisplayNameOrDefault(getPersonalDetailByEmail(finalApprover), finalApprover, false);
    };

    // Gusto right component
    let gustoRowRightComponent;
    if (!isGustoConnectedState) {
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
                menuItems={gustoOverflowMenu}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
        );
    }

    // Zenefits right component
    let zenefitsRowRightComponent;
    if (!isZenefitsConnectedState) {
        zenefitsRowRightComponent = (
            <Button
                small
                text={translate('workspace.hr.zenefits.connect')}
                onPress={() => setActiveZenefitsFlowKey(Math.random())}
            />
        );
    } else if (isZenefitsSyncInProgress) {
        zenefitsRowRightComponent = (
            <ActivityIndicator
                style={[styles.popoverMenuIcon]}
                reasonAttributes={{context: 'WorkspaceHRPage.zenefitsSync'}}
            />
        );
    } else {
        zenefitsRowRightComponent = (
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={zenefitsOverflowMenu}
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
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GUSTO) && !isBetaEnabled(CONST.BETAS.ZENEFITS)}
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
                {!!activeZenefitsFlowKey && (
                    <ConnectToZenefitsFlow
                        key={activeZenefitsFlowKey}
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
                            {/* Gusto card */}
                            <MenuItem
                                title={translate('workspace.hr.gusto.title')}
                                icon={icons.GustoSquare}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                wrapperStyle={[styles.ph0, styles.pv2, styles.mt4, !!gustoLastSyncErrorMessage && styles.pb0]}
                                interactive={false}
                                description={gustoConnectionDescription}
                                errorText={gustoLastSyncErrorMessage}
                                errorTextStyle={[styles.mt5]}
                                shouldShowRedDotIndicator
                                shouldShowRightComponent
                                rightComponent={gustoRowRightComponent}
                            />
                            {isGustoConnectedState && (
                                <>
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
                                    <OfflineWithFeedback pendingAction={gustoConfig?.pendingFields?.finalApprover}>
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.hr.gusto.finalApprover')}
                                            title={getFinalApproverDisplayName(gustoConfig?.finalApprover, 'workspace.hr.gusto.notSet')}
                                            style={styles.sectionMenuItemTopDescription}
                                            shouldShowRightIcon
                                            brickRoadIndicator={gustoConfig?.errorFields?.finalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(policyID))}
                                        />
                                    </OfflineWithFeedback>
                                </>
                            )}

                            {/* TriNet (Zenefits) card */}
                            <MenuItem
                                title={translate('workspace.hr.zenefits.title')}
                                icon={icons.ZenefitsSquare}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                wrapperStyle={[styles.ph0, styles.pv2, styles.mt4, !!zenefitsLastSyncErrorMessage && styles.pb0]}
                                interactive={false}
                                description={zenefitsConnectionDescription}
                                errorText={zenefitsLastSyncErrorMessage}
                                errorTextStyle={[styles.mt5]}
                                shouldShowRedDotIndicator
                                shouldShowRightComponent
                                rightComponent={zenefitsRowRightComponent}
                            />
                            {isZenefitsConnectedState && (
                                <>
                                    <OfflineWithFeedback pendingAction={zenefitsConfig?.pendingFields?.approvalMode}>
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.hr.zenefits.approvalMode')}
                                            title={getZenefitsApprovalModeLabel(zenefitsConfig?.approvalMode)}
                                            style={[styles.sectionMenuItemTopDescription, styles.mt2]}
                                            shouldShowRightIcon
                                            brickRoadIndicator={zenefitsConfig?.errorFields?.approvalMode ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_ZENEFITS_APPROVAL_MODE.getRoute(policyID))}
                                        />
                                    </OfflineWithFeedback>
                                    <OfflineWithFeedback pendingAction={zenefitsConfig?.pendingFields?.finalApprover}>
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.hr.zenefits.finalApprover')}
                                            title={getFinalApproverDisplayName(zenefitsConfig?.finalApprover, 'workspace.hr.zenefits.notSet')}
                                            style={styles.sectionMenuItemTopDescription}
                                            shouldShowRightIcon
                                            brickRoadIndicator={zenefitsConfig?.errorFields?.finalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER.getRoute(policyID))}
                                        />
                                    </OfflineWithFeedback>
                                </>
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
                <ConfirmModal
                    title={translate('workspace.hr.zenefits.disconnectTitle')}
                    isVisible={isZenefitsDisconnectModalOpen}
                    onConfirm={() => {
                        if (policy) {
                            removePolicyConnection(policy, CONST.POLICY.CONNECTIONS.NAME.ZENEFITS);
                        }
                        setIsZenefitsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsZenefitsDisconnectModalOpen(false)}
                    prompt={translate('workspace.hr.zenefits.disconnectPrompt')}
                    confirmText={translate('workspace.hr.zenefits.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceHRPage;
