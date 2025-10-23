import React, {useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canModifyPlan, isCollectPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {downgradeToTeam} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DowngradeConfirmation from './DowngradeConfirmation';
import DowngradeIntro from './DowngradeIntro';

type WorkspaceDowngradePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DOWNGRADE>;

function WorkspaceDowngradePage({route}: WorkspaceDowngradePageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isDowngradeWarningModalOpen, setIsDowngradeWarningModalOpen] = useState(false);

    const canPerformDowngrade = useMemo(() => canModifyPlan(policyID), [policyID]);
    const isDowngraded = useMemo(() => isCollectPolicy(policy), [policy]);

    const onDowngradeToTeam = () => {
        if (!canPerformDowngrade || !policy) {
            return;
        }
        if (Object.keys(companyFeeds).length > 1) {
            setIsDowngradeWarningModalOpen(true);
            return;
        }
        downgradeToTeam(policy.id);
    };

    const onClose = () => {
        setIsDowngradeWarningModalOpen(false);
        Navigation.dismissModal();
    };

    const dismissModalAndNavigate = (targetPolicyID: string) => {
        Navigation.dismissModal();
        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(targetPolicyID));
            InteractionManager.runAfterInteractions(() => {
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(targetPolicyID));
            });
        });
    };

    const onMoveToCompanyCardFeeds = () => {
        if (!policyID) {
            return;
        }

        setIsDowngradeWarningModalOpen(false);
        InteractionManager.runAfterInteractions(() => dismissModalAndNavigate(policyID));
    };

    if (!canPerformDowngrade) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceDowngradePage"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('common.downgradeWorkspace')}
                onBackButtonPress={() => {
                    if (isDowngraded) {
                        Navigation.dismissModal();
                    } else {
                        Navigation.goBack();
                    }
                }}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {isDowngraded && !!policyID && (
                    <DowngradeConfirmation
                        onConfirmDowngrade={() => {
                            Navigation.dismissModal();
                        }}
                        policyID={policyID}
                    />
                )}
                {!isDowngraded && (
                    <DowngradeIntro
                        policyID={policyID}
                        onDowngrade={onDowngradeToTeam}
                        buttonDisabled={isOffline}
                        loading={policy?.isPendingDowngrade}
                        backTo={route.params.backTo}
                    />
                )}
            </ScrollView>
            <ConfirmModal
                title={translate('workspace.moreFeatures.companyCards.downgradeTitle')}
                isVisible={isDowngradeWarningModalOpen}
                onConfirm={onClose}
                shouldShowCancelButton={false}
                onCancel={onClose}
                prompt={
                    <Text>
                        {translate('workspace.moreFeatures.companyCards.downgradeSubTitleFirstPart')}{' '}
                        <TextLink
                            style={styles.link}
                            onPress={onMoveToCompanyCardFeeds}
                        >
                            {translate('workspace.moreFeatures.companyCards.downgradeSubTitleMiddlePart')}
                        </TextLink>{' '}
                        {translate('workspace.moreFeatures.companyCards.downgradeSubTitleLastPart')}
                    </Text>
                }
                confirmText={translate('common.buttonConfirm')}
            />
        </ScreenWrapper>
    );
}

export default WorkspaceDowngradePage;
