import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ConnectToGustoFlow from '@components/ConnectToGustoFlow';
import ConnectToZenefitsFlow from '@components/ConnectToZenefitsFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useConfirmModal from '@hooks/useConfirmModal';
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
    const {showConfirmModal} = useConfirmModal();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'ZenefitsSquare', 'Sync', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);

    // Gusto state
    const gustoConnection = policy?.connections?.gusto;
    const gustoConfig = gustoConnection?.config;
    const isGustoConnectionActive = isGustoConnected(policy);
    const isGustoSyncInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO && isConnectionInProgress(connectionSyncProgress, policy);
    const gustoStageInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress?.stageInProgress : undefined;
    const gustoSuccessfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        gustoConnection,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress : undefined,
    );
    const hasGustoSyncError = !isGustoSyncInProgress && gustoConnection?.lastSync?.isSuccessful === false && !!gustoConnection?.lastSync?.errorDate;
    const gustoSyncErrorMessage = hasGustoSyncError ? (gustoConnection?.lastSync?.errorMessage ?? translate('workspace.hr.gusto.syncError')) : undefined;
    let gustoConnectionDescription;
    if (isGustoSyncInProgress && gustoStageInProgress) {
        gustoConnectionDescription = translate('workspace.hr.syncStageName', {stage: gustoStageInProgress});
    } else if (gustoSuccessfulDate && !gustoSyncErrorMessage) {
        gustoConnectionDescription = translate('workspace.hr.gusto.lastSync', datetimeToRelative(gustoSuccessfulDate));
    }

    // Zenefits state
    const zenefitsConnection = policy?.connections?.zenefits;
    const zenefitsConfig = zenefitsConnection?.config;
    const isZenefitsConnectionActive = isZenefitsConnected(policy);
    const isZenefitsSyncInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS && isConnectionInProgress(connectionSyncProgress, policy);
    const zenefitsStageInProgress = connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS ? connectionSyncProgress?.stageInProgress : undefined;
    const zenefitsSuccessfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        zenefitsConnection,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS ? connectionSyncProgress : undefined,
    );
    const hasZenefitsSyncError = !isZenefitsSyncInProgress && zenefitsConnection?.lastSync?.isSuccessful === false && !!zenefitsConnection?.lastSync?.errorDate;
    const zenefitsSyncErrorMessage = hasZenefitsSyncError ? (zenefitsConnection?.lastSync?.errorMessage ?? translate('workspace.hr.zenefits.syncError')) : undefined;
    let zenefitsConnectionDescription;
    if (isZenefitsSyncInProgress && zenefitsStageInProgress) {
        zenefitsConnectionDescription = translate('workspace.hr.syncStageName', {stage: zenefitsStageInProgress});
    } else if (zenefitsSuccessfulDate && !zenefitsSyncErrorMessage) {
        zenefitsConnectionDescription = translate('workspace.hr.zenefits.lastSync', datetimeToRelative(zenefitsSuccessfulDate));
    }

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    const fetchPolicyHRPage = useCallback(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPolicyHRPage});

    useEffect(() => {
        fetchPolicyHRPage();
    }, [fetchPolicyHRPage]);

    const showGustoDisconnectModal = () => {
        showConfirmModal({
            title: translate('workspace.hr.gusto.disconnectTitle'),
            prompt: translate('workspace.hr.gusto.disconnectPrompt'),
            confirmText: translate('workspace.hr.gusto.disconnect'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM || !policy) {
                return;
            }
            removePolicyConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO);
        });
    };

    const showZenefitsDisconnectModal = () => {
        showConfirmModal({
            title: translate('workspace.hr.zenefits.disconnectTitle'),
            prompt: translate('workspace.hr.zenefits.disconnectPrompt'),
            confirmText: translate('workspace.hr.zenefits.disconnect'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM || !policy) {
                return;
            }
            removePolicyConnection(policy, CONST.POLICY.CONNECTIONS.NAME.ZENEFITS);
        });
    };

    const gustoOverflowMenu: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: icons.Sync,
            text: translate('workspace.hr.gusto.syncNow'),
            onSelected: () => syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO),
            disabled: isOffline,
        },
        {
            icon: icons.Trashcan,
            text: translate('workspace.hr.gusto.disconnect'),
            onSelected: showGustoDisconnectModal,
            shouldCallAfterModalHide: true,
        },
    ];

    const zenefitsOverflowMenu: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: icons.Sync,
            text: translate('workspace.hr.zenefits.syncNow'),
            onSelected: () => syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.ZENEFITS),
            disabled: isOffline,
        },
        {
            icon: icons.Trashcan,
            text: translate('workspace.hr.zenefits.disconnect'),
            onSelected: showZenefitsDisconnectModal,
            shouldCallAfterModalHide: true,
        },
    ];

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

    const getGustoFinalApproverDisplayName = (finalApprover?: string | null) => {
        if (!finalApprover) {
            return translate('workspace.hr.gusto.notSet');
        }

        return getDisplayNameOrDefault(getPersonalDetailByEmail(finalApprover), finalApprover, false);
    };

    const getZenefitsFinalApproverDisplayName = (finalApprover?: string | null) => {
        if (!finalApprover) {
            return translate('workspace.hr.zenefits.notSet');
        }

        return getDisplayNameOrDefault(getPersonalDetailByEmail(finalApprover), finalApprover, false);
    };

    let gustoRowRightComponent;
    if (!isGustoConnectionActive) {
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

    let zenefitsRowRightComponent;
    if (!isZenefitsConnectionActive) {
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
                            {isBetaEnabled(CONST.BETAS.GUSTO) && (
                                <>
                                    <MenuItem
                                        title={translate('workspace.hr.gusto.title')}
                                        icon={icons.GustoSquare}
                                        iconType={CONST.ICON_TYPE_AVATAR}
                                        wrapperStyle={[styles.ph0, styles.pv2, styles.mt4, !!gustoSyncErrorMessage && styles.pb0]}
                                        interactive={false}
                                        description={gustoConnectionDescription}
                                        errorText={gustoSyncErrorMessage}
                                        errorTextStyle={[styles.mt5]}
                                        shouldShowRedDotIndicator
                                        shouldShowRightComponent
                                        rightComponent={gustoRowRightComponent}
                                    />
                                    {isGustoConnectionActive && (
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
                                                    title={getGustoFinalApproverDisplayName(gustoConfig?.finalApprover)}
                                                    style={styles.sectionMenuItemTopDescription}
                                                    shouldShowRightIcon
                                                    brickRoadIndicator={gustoConfig?.errorFields?.finalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(policyID))}
                                                />
                                            </OfflineWithFeedback>
                                        </>
                                    )}
                                </>
                            )}
                            {isBetaEnabled(CONST.BETAS.ZENEFITS) && (
                                <>
                                    <MenuItem
                                        title={translate('workspace.hr.zenefits.title')}
                                        icon={icons.ZenefitsSquare}
                                        iconType={CONST.ICON_TYPE_AVATAR}
                                        wrapperStyle={[styles.ph0, styles.pv2, styles.mt4, !!zenefitsSyncErrorMessage && styles.pb0]}
                                        interactive={false}
                                        description={zenefitsConnectionDescription}
                                        errorText={zenefitsSyncErrorMessage}
                                        errorTextStyle={[styles.mt5]}
                                        shouldShowRedDotIndicator
                                        shouldShowRightComponent
                                        rightComponent={zenefitsRowRightComponent}
                                    />
                                    {isZenefitsConnectionActive && (
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
                                                    title={getZenefitsFinalApproverDisplayName(zenefitsConfig?.finalApprover)}
                                                    style={styles.sectionMenuItemTopDescription}
                                                    shouldShowRightIcon
                                                    brickRoadIndicator={zenefitsConfig?.errorFields?.finalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER.getRoute(policyID))}
                                                />
                                            </OfflineWithFeedback>
                                        </>
                                    )}
                                </>
                            )}
                        </Section>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceHRPage;
