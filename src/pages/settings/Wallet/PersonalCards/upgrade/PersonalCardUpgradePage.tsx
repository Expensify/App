import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {createWorkspaceWithPolicyDraft} from '@userActions/App';
import {generatePolicyID} from '@userActions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';
import UpgradeConfirmation from './UpgradeConfirmation';
import UpgradeIntro from './UpgradeIntro';

function PersonalCardUpgradePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isUpgraded, setIsUpgraded] = useState(false);
    const policyID = generatePolicyID();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const onUpgrade = () => {
        createWorkspaceWithPolicyDraft({
            introSelected,
            policyOwnerEmail: '',
            transitionFromOldDot: false,
            makeMeAdmin: false,
            policyID,
            lastUsedPaymentMethod: lastPaymentMethod?.[policyID] as LastPaymentMethodType,
            activePolicyID,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            shouldCreateControlPolicy: false,
            isSelfTourViewed,
        });
        setIsUpgraded(true);
    };

    const addPersonalCard = () => {
        Navigation.closeRHPFlow();
        // TODO navigate to add personal card
    };

    const addCompanyCard = () => {
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="personalCardUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen={!isUpgraded}
        >
            <HeaderWithBackButton
                title={translate(isUpgraded ? 'personalCard.workspaceCreated' : 'onboarding.workspace.createWorkspace')}
                onBackButtonPress={() => {
                    if (isUpgraded) {
                        Navigation.closeRHPFlow();
                    } else {
                        Navigation.goBack();
                    }
                }}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {isUpgraded && (
                    <UpgradeConfirmation
                        addPersonalCard={addPersonalCard}
                        addCompanyCard={addCompanyCard}
                    />
                )}
                {!isUpgraded && (
                    <UpgradeIntro
                        onUpgrade={onUpgrade}
                        buttonDisabled={isOffline}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default PersonalCardUpgradePage;
