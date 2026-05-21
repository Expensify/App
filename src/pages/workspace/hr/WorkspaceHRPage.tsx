import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import CollapsibleSection from '@components/CollapsibleSection';
import ConnectToHRFlow from '@components/ConnectToHRFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useHRSyncResultsModal from '@hooks/useHRSyncResultsModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyHRPage} from '@libs/actions/PolicyConnections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import HRProviderCard from './HRProviderCard';
import type {HRCardDescriptor} from './utils';
import {getHRCards} from './utils';

const HR_BETAS = [CONST.BETAS.GUSTO, CONST.BETAS.ZENEFITS, CONST.BETAS.MERGE_HR] as const;

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'ZenefitsSquare']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);
    const [activeHRFlow, setActiveHRFlow] = useState<{setupLink: string; key: number} | undefined>();

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    useNetwork({onReconnect: () => openPolicyHRPage(policyID)});

    useEffect(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    useHRSyncResultsModal(policyID, connectionSyncProgress, isFocused);

    const cards = getHRCards({
        policy,
        connectionSyncProgress,
        getLocalDateFromDatetime,
        isBetaEnabled,
        translate,
        policyID,
        gustoIcon: icons.GustoSquare,
        zenefitsIcon: icons.ZenefitsSquare,
    });

    const connectedCards: HRCardDescriptor[] = [];
    const disconnectedCards: HRCardDescriptor[] = [];
    for (const card of cards) {
        (card.isConnected ? connectedCards : disconnectedCards).push(card);
    }
    const byName = (a: HRCardDescriptor, b: HRCardDescriptor) => localeCompare(a.displayName, b.displayName);
    connectedCards.sort(byName);
    disconnectedCards.sort(byName);

    const shouldBeBlocked = !HR_BETAS.some(isBetaEnabled);

    const handleConnect = (setupLink: string | undefined) => {
        if (!setupLink) {
            return;
        }
        // eslint-disable-next-line react-hooks/purity -- random key forces remount on every press, even for the same provider
        setActiveHRFlow({setupLink, key: Math.random()});
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
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
                            contentPaddingOnLargeScreens={{padding: 24}}
                            isCentralPane
                            renderTitle={() => <Text style={[styles.textStrong]}>{translate('workspace.hr.connections')}</Text>}
                        >
                            <View style={styles.mt4}>
                                {connectedCards.map((card) => (
                                    <HRProviderCard
                                        key={card.key}
                                        card={card}
                                        policy={policy}
                                        handleConnect={() => handleConnect(card.setupLink)}
                                    />
                                ))}
                                {connectedCards.length === 0 &&
                                    disconnectedCards.map((card) => (
                                        <HRProviderCard
                                            key={card.key}
                                            card={card}
                                            policy={policy}
                                            handleConnect={() => handleConnect(card.setupLink)}
                                        />
                                    ))}
                            </View>

                            {connectedCards.length > 0 && disconnectedCards.length > 0 && (
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
                                            handleConnect={() => handleConnect(card.setupLink)}
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
