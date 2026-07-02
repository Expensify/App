import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import CollapsibleSection from '@components/CollapsibleSection';
import ConnectToHRFlow from '@components/ConnectToHRFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useConfirmModal from '@hooks/useConfirmModal';
import useHRSyncResultsModal from '@hooks/useHRSyncResultsModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMergeHRInitialSyncingModal from '@hooks/useMergeHRInitialSyncingModal';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyHRPage} from '@libs/actions/PolicyConnections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import HRProviderCard from './HRProviderCard';
import type {HRCardDescriptor} from './utils';
import {getHRCards} from './utils';

type WorkspaceHRPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;

function WorkspaceHRPage({
    route: {
        params: {policyID},
    },
}: WorkspaceHRPageProps) {
    const {translate, getLocalDateFromDatetime, localeCompare} = useLocalize();
    const isFocused = useIsFocused();
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'TriNetSquare']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);
    const [activeHRFlow, setActiveHRFlow] = useState<{setupLink: string; key: number} | undefined>();
    const {showConfirmModal} = useConfirmModal();

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    useNetwork({onReconnect: () => openPolicyHRPage(policyID)});

    useEffect(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    useHRSyncResultsModal(policyID, connectionSyncProgress, isFocused);
    useMergeHRInitialSyncingModal(policyID, isFocused);

    const cards = getHRCards({
        policy,
        connectionSyncProgress,
        getLocalDateFromDatetime,
        isBetaEnabled,
        translate,
        policyID,
        gustoIcon: icons.GustoSquare,
        trinetIcon: icons.TriNetSquare,
    });

    const connectedCards: HRCardDescriptor[] = [];
    const disconnectedCards: HRCardDescriptor[] = [];
    for (const card of cards) {
        (card.isConnected ? connectedCards : disconnectedCards).push(card);
    }
    const byName = (a: HRCardDescriptor, b: HRCardDescriptor) => localeCompare(a.displayName, b.displayName);
    connectedCards.sort(byName);
    disconnectedCards.sort(byName);

    const {canWrite: canWriteMoreFeatures, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const handleConnect = (card: HRCardDescriptor) => {
        if (!card.setupLink) {
            return;
        }

        if (!canWriteMoreFeatures) {
            showReadOnlyModal();
            return;
        }

        if (!card.isConnected && connectedCards.length > 0) {
            showConfirmModal({
                title: translate('workspace.hr.alreadyConnectedTitle'),
                prompt: translate('workspace.hr.alreadyConnectedPrompt'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.wideConfirmModalWidth),
            });
            return;
        }

        // eslint-disable-next-line react-hooks/purity -- random key forces remount on every press, even for the same provider
        setActiveHRFlow({setupLink: card.setupLink, key: Math.random()});
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="WorkspaceHRPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                {!!activeHRFlow && (
                    <ConnectToHRFlow
                        key={activeHRFlow.key}
                        setupLink={activeHRFlow.setupLink}
                        onDone={() => setActiveHRFlow(undefined)}
                    />
                )}
                <HeaderWithBackButton
                    icon={illustrations.NewUser}
                    title={translate('workspace.hr.title')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('workspace.hr.connections')}
                            subtitle={translate('workspace.hr.connectionsSubtitle')}
                            isCentralPane
                            subtitleMuted
                            titleStyles={styles.accountSettingsSectionTitle}
                            childrenStyles={styles.pt5}
                        >
                            <View>
                                {connectedCards.map((card) => (
                                    <HRProviderCard
                                        key={card.key}
                                        card={card}
                                        policy={policy}
                                        handleConnect={() => handleConnect(card)}
                                        canWriteMoreFeatures={canWriteMoreFeatures}
                                        showReadOnlyModal={showReadOnlyModal}
                                    />
                                ))}
                                {connectedCards.length === 0 &&
                                    disconnectedCards.map((card) => (
                                        <HRProviderCard
                                            key={card.key}
                                            card={card}
                                            policy={policy}
                                            handleConnect={() => handleConnect(card)}
                                            canWriteMoreFeatures={canWriteMoreFeatures}
                                            showReadOnlyModal={showReadOnlyModal}
                                        />
                                    ))}
                            </View>

                            {connectedCards.length > 0 && disconnectedCards.length > 0 && !connectedCards.some((c) => c.isInitialSyncInProgress) && (
                                <CollapsibleSection
                                    title={translate('workspace.accounting.other')}
                                    wrapperStyle={[styles.pr3, styles.mt5, styles.pv3]}
                                    titleStyle={[styles.textNormal, styles.colorMuted]}
                                    textStyle={[styles.flex1, styles.userSelectNone, styles.textNormal, styles.colorMuted]}
                                >
                                    {disconnectedCards.map((card) => (
                                        <HRProviderCard
                                            key={card.key}
                                            card={card}
                                            policy={policy}
                                            handleConnect={() => handleConnect(card)}
                                            canWriteMoreFeatures={canWriteMoreFeatures}
                                            showReadOnlyModal={showReadOnlyModal}
                                        />
                                    ))}
                                </CollapsibleSection>
                            )}
                        </Section>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceHRPage;
