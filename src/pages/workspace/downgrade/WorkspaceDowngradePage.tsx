import React, {useCallback} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import DowngradeConfirmation from './DowngradeConfirmation';
import DowngradeIntro from './DowngradeIntro';

type WorkspaceDowngradePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DOWNGRADE>;

function WorkspaceDowngradePage({route}: WorkspaceDowngradePageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const {accountID} = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const ownerPoliciesSelectorWithAccountID = useCallback((policies: OnyxCollection<Policy>) => ownerPoliciesSelector(policies, accountID), [accountID]);
    const [ownerPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false, selector: ownerPoliciesSelectorWithAccountID});
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const canPerformDowngrade = () => canModifyPlan(ownerPolicies, policy);
    const isDowngraded = isCollectPolicy(policy);

    const dismissModalAndNavigate = (targetPolicyID: string) => {
        Navigation.dismissModal();
        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(targetPolicyID));

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(targetPolicyID));
            });
        });
    };

    const onMoveToCompanyCardFeeds = () => {
        if (!policyID) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => dismissModalAndNavigate(policyID));
    };

    const onDowngradeToTeam = async () => {
        if (!canPerformDowngrade || !policy || !policyID) {
            return;
        }
        if (Object.keys(companyFeeds).length > 1) {
            const result = await showConfirmModal({
                title: translate('workspace.moreFeatures.companyCards.downgradeTitle'),
                prompt: (
                    <View style={styles.flexRow}>
                        <RenderHTML
                            html={translate('workspace.moreFeatures.companyCards.downgradeSubTitle')}
                            onLinkPress={onMoveToCompanyCardFeeds}
                        />
                    </View>
                ),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            dismissModalAndNavigate(policyID);
            return;
        }
        downgradeToTeam(policy.id);
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
        </ScreenWrapper>
    );
}

export default WorkspaceDowngradePage;
