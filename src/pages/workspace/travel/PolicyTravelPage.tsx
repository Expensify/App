import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Luggage} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getTravelDisplayComponent} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import BookOrManageYourTrip from './BookOrManageYourTrip';
import GetStartedTravel from './GetStartedTravel';
import ReviewingRequest from './ReviewingRequest';

type WorkspaceTravelPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL>;

function WorkspaceTravelPage({
    route: {
        params: {policyID},
    },
}: WorkspaceTravelPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const mainContent = useMemo(() => {
        const componentType = getTravelDisplayComponent(policy, travelSettings, isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED), policies, currentUserLogin);

        switch (componentType) {
            case 'BookOrManageYourTrip':
                return <BookOrManageYourTrip policyID={policyID} />;
            case 'ReviewingRequest':
                return <ReviewingRequest />;
            default:
                return <GetStartedTravel policyID={policyID} />;
        }
    }, [policy, travelSettings, isBetaEnabled, policies, currentUserLogin, policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspaceTravelPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={Luggage}
                    title={translate('workspace.moreFeatures.travel.title')}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.popToSidebar}
                />
                <View style={[styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>{mainContent}</View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default WorkspaceTravelPage;
