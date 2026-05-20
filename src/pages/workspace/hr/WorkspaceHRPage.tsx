import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConnectToGustoFlow from '@components/ConnectToGustoFlow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
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
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'ZenefitsSquare', 'DownArrow', 'UpArrow']);
    const illustrations = useMemoizedLazyIllustrations(['NewUser']);
    const [activeGustoFlowKey, setActiveGustoFlowKey] = useState<number>();

    const [isOtherExpanded, setIsOtherExpanded] = useState(false);

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

    const connectedCards: HRCardDescriptor[] = [];
    const disconnectedCards: HRCardDescriptor[] = [];
    for (const card of cards) {
        (card.isConnected ? connectedCards : disconnectedCards).push(card);
    }
    const byName = (a: HRCardDescriptor, b: HRCardDescriptor) => localeCompare(a.displayName, b.displayName);
    connectedCards.sort(byName);
    disconnectedCards.sort(byName);

    const shouldBeBlocked = !HR_BETAS.some(isBetaEnabled);

    const onConnect = (connectionName: string) => {
        if (connectionName !== CONST.POLICY.CONNECTIONS.NAME.GUSTO) {
            return;
        }
        // eslint-disable-next-line react-hooks/purity
        setActiveGustoFlowKey(Math.random());
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
                            renderTitle={() => <Text style={[styles.textStrong]}>{translate('workspace.common.hr')}</Text>}
                        >
                            <View style={styles.mt4}>
                                {connectedCards.map((card) => (
                                    <HRProviderCard
                                        key={card.key}
                                        card={card}
                                        policy={policy}
                                        onConnect={() => onConnect(card.connectionName)}
                                    />
                                ))}

                                {connectedCards.length === 0 &&
                                    disconnectedCards.map((card) => (
                                        <HRProviderCard
                                            key={card.key}
                                            card={card}
                                            policy={policy}
                                            onConnect={() => onConnect(card.connectionName)}
                                        />
                                    ))}
                            </View>

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
                                    {isOtherExpanded &&
                                        disconnectedCards.map((card) => (
                                            <HRProviderCard
                                                key={card.key}
                                                card={card}
                                                policy={policy}
                                                onConnect={() => onConnect(card.connectionName)}
                                            />
                                        ))}
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
