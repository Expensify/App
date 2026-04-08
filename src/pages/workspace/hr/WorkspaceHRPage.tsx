import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConnectToGustoFlow from '@components/ConnectToGustoFlow';
import ConfirmModal from '@components/ConfirmModal';
import GustoSyncResultsModal from '@components/GustoSyncResultsModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {isConnectionInProgress, removePolicyConnection} from '@libs/actions/connections';
import {openPolicyHRPage} from '@libs/actions/PolicyConnections';
import {syncGusto} from '@libs/actions/connections/Gusto';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getIntegrationLastSuccessfulDate, isGustoConnected} from '@libs/PolicyUtils';
import type {AnchorPosition} from '@src/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import AccessOrNotFoundWrapper from '../AccessOrNotFoundWrapper';
import {getGustoConnectionMessage, getGustoSettingRows} from './utils';

type WorkspaceHRPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;

function WorkspaceHRPage({route}: WorkspaceHRPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.hr');
    const styles = useThemeStyles();
    const {translate, datetimeToRelative, getLocalDateFromDatetime} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'GustoSquare', 'Sync', 'Trashcan']);
    const [connectFlowKey, setConnectFlowKey] = useState(0);
    const [isDisconnectModalVisible, setIsDisconnectModalVisible] = useState(false);
    const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);
    const prevStage = usePrevious(connectionSyncProgress?.stageInProgress);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const isConnected = isGustoConnected(policy);
    const successfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        policy?.connections?.gusto,
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO ? connectionSyncProgress : undefined,
    );
    const datetimeToRelativeValue = successfulDate ? datetimeToRelative(successfulDate) : '';
    const settingRows = useMemo(() => getGustoSettingRows(policyID, policy, personalDetails ?? undefined, translate), [policyID, policy, personalDetails, translate]);

    const fetchHRPage = useCallback(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);
    const {isOffline} = useNetwork({onReconnect: fetchHRPage});

    useEffect(() => {
        fetchHRPage();
    }, [fetchHRPage]);

    const completedGustoSync =
        isFocused &&
        connectionSyncProgress?.connectionName === CONST.POLICY.CONNECTIONS.NAME.GUSTO &&
        prevStage !== undefined &&
        prevStage !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        !!connectionSyncProgress?.result;

    useEffect(() => {
        if (!completedGustoSync) {
            return;
        }
        setIsResultsModalVisible(true);
    }, [completedGustoSync]);

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }

        return new Promise<AnchorPosition>((resolve) => {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: icons.Sync,
            text: translate('workspace.hr.gusto.menu.syncNow'),
            onSelected: () => syncGusto(policy),
            disabled: isOffline || isSyncInProgress,
        },
        {
            icon: icons.Trashcan,
            text: translate('workspace.hr.gusto.menu.disconnect'),
            onSelected: () => setIsDisconnectModalVisible(true),
            shouldCallAfterModalHide: true,
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceHRPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                {connectFlowKey > 0 && (
                    <ConnectToGustoFlow
                        key={connectFlowKey}
                        policyID={policyID}
                    />
                )}
                <HeaderWithBackButton
                    title={translate('workspace.common.hr')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <Section title={translate('workspace.hr.settingsTitle')}>
                        <MenuItemWithTopDescription
                            title={translate('workspace.hr.gusto.title')}
                            description={getGustoConnectionMessage(policy, connectionSyncProgress, isSyncInProgress, datetimeToRelativeValue, translate)}
                            icon={icons.GustoSquare}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            interactive={false}
                            wrapperStyle={[styles.sectionMenuItemTopDescription]}
                            shouldShowRightComponent
                            rightComponent={
                                isConnected ? (
                                    <View ref={threeDotsMenuContainerRef}>
                                        <ThreeDotsMenu
                                            getAnchorPosition={calculateAndSetThreeDotsMenuPosition}
                                            menuItems={overflowMenu}
                                            anchorAlignment={{
                                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                            }}
                                        />
                                    </View>
                                ) : (
                                    <Button
                                        small
                                        text={translate('workspace.hr.connect')}
                                        onPress={() => setConnectFlowKey((currentKey) => currentKey + 1)}
                                        isDisabled={isOffline}
                                    />
                                )
                            }
                        />
                        {isConnected &&
                            settingRows.map((row) => (
                                <OfflineWithFeedback
                                    key={row.route}
                                    pendingAction={row.pendingAction}
                                    errors={row.errors}
                                >
                                    <MenuItem
                                        title={row.title}
                                        description={row.description}
                                        iconRight={icons.ArrowRight}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(row.route)}
                                    />
                                </OfflineWithFeedback>
                            ))}
                    </Section>
                </ScrollView>
                <ConfirmModal
                    title={translate('workspace.hr.gusto.disconnectTitle')}
                    isVisible={isDisconnectModalVisible}
                    onConfirm={() => {
                        setIsDisconnectModalVisible(false);
                        if (policy?.connections?.gusto) {
                            removePolicyConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO);
                        }
                    }}
                    onCancel={() => setIsDisconnectModalVisible(false)}
                    prompt={translate('workspace.hr.gusto.disconnectPrompt')}
                    confirmText={translate('workspace.hr.gusto.menu.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <GustoSyncResultsModal
                    isVisible={isResultsModalVisible}
                    onClose={() => setIsResultsModalVisible(false)}
                    result={connectionSyncProgress?.result}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceHRPage;
