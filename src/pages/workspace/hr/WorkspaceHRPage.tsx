import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import ConnectToHRFlow from '@components/ConnectToHRFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useGustoSyncResultsModal from '@hooks/useGustoSyncResultsModal';
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
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'ZenefitsSquare', 'DownArrow', 'UpArrow']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);

    const [isOtherExpanded, setIsOtherExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingConnection, setPendingConnection] = useState<{card: HRCardDescriptor; key: number} | null>(null);
    const connectFlowKeyRef = useRef(0);

    useWorkspaceDocumentTitle(undefined, 'workspace.common.hr');

    useNetwork({onReconnect: () => openPolicyHRPage(policyID)});

    useEffect(() => {
        openPolicyHRPage(policyID);
    }, [policyID]);

    useGustoSyncResultsModal(policyID, connectionSyncProgress, isFocused);

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

    const connectedCards = cards.filter((c) => c.isConnected).sort((a, b) => localeCompare(a.displayName, b.displayName));
    const disconnectedCards = cards.filter((c) => !c.isConnected).sort((a, b) => localeCompare(a.displayName, b.displayName));

    const visibleDisconnectedCards = searchQuery ? disconnectedCards.filter((c) => c.displayName.toLowerCase().includes(searchQuery.toLowerCase())) : disconnectedCards;

    const shouldBeBlocked = !isBetaEnabled(CONST.BETAS.GUSTO) && !isBetaEnabled(CONST.BETAS.ZENEFITS) && !isBetaEnabled(CONST.BETAS.MERGE_HR);

    const handleConnect = (card: HRCardDescriptor) => {
        if (!card.setupLink) {
            return;
        }
        connectFlowKeyRef.current += 1;
        setPendingConnection({card, key: connectFlowKeyRef.current});
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
                {!!pendingConnection?.card.setupLink && (
                    <ConnectToHRFlow
                        key={pendingConnection.key}
                        setupLink={pendingConnection.card.setupLink}
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
                            {connectedCards.map((card, index) => (
                                <HRProviderCard
                                    key={card.key}
                                    card={card}
                                    policy={policy}
                                    isFirst={index === 0}
                                    onConnect={() => handleConnect(card)}
                                />
                            ))}

                            {connectedCards.length === 0 &&
                                disconnectedCards.map((card, index) => (
                                    <HRProviderCard
                                        key={card.key}
                                        card={card}
                                        policy={policy}
                                        isFirst={index === 0}
                                        onConnect={() => handleConnect(card)}
                                    />
                                ))}

                            {connectedCards.length > 0 && disconnectedCards.length > 0 && (
                                <>
                                    <MenuItem
                                        title={translate('common.other')}
                                        shouldShowRightIcon
                                        icon={isOtherExpanded ? icons.UpArrow : icons.DownArrow}
                                        onPress={() => setIsOtherExpanded((prev) => !prev)}
                                        wrapperStyle={[styles.ph0, styles.pv2, styles.mt4]}
                                        role={CONST.ROLE.BUTTON}
                                    />
                                    {isOtherExpanded && (
                                        <>
                                            {disconnectedCards.length > 12 && (
                                                <TextInput
                                                    value={searchQuery}
                                                    onChangeText={setSearchQuery}
                                                    placeholder={translate('common.search')}
                                                    accessibilityLabel={translate('common.search')}
                                                    containerStyles={[styles.mb3]}
                                                />
                                            )}
                                            {visibleDisconnectedCards.map((card) => (
                                                <HRProviderCard
                                                    key={card.key}
                                                    card={card}
                                                    policy={policy}
                                                    onConnect={() => handleConnect(card)}
                                                />
                                            ))}
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
