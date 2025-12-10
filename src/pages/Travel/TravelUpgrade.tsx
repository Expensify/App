import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import {getActivePolicies, isPaidGroupPolicy} from '@libs/PolicyUtils';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TravelUpgradeProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.UPGRADE>;

function TravelUpgrade({route}: TravelUpgradeProps) {
    const styles = useThemeStyles();
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.travel;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const groupPaidPolicies = getActivePolicies(policies, currentUserLogin).filter(isPaidGroupPolicy);

    const [isUpgraded, setIsUpgraded] = useState(false);

    useEffect(() => {
        if (groupPaidPolicies.length < 1) {
            return;
        }
        setIsUpgraded(true);
    }, [groupPaidPolicies.length]);

    const openWorkspaceConfirmation = () => {
        Navigation.navigate(ROUTES.TRAVEL_WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()));
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID={TravelUpgrade.displayName}
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen={!isUpgraded}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => Navigation.goBack(route.params?.backTo)}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {isUpgraded ? (
                    <UpgradeConfirmation
                        afterUpgradeAcknowledged={() => Navigation.goBack()}
                        policyName=""
                        isTravelUpgrade
                    />
                ) : (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={openWorkspaceConfirmation}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

TravelUpgrade.displayName = 'TravelUpgrade';

export default TravelUpgrade;
