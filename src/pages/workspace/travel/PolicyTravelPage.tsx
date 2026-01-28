import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getTravelStep} from '@libs/PolicyUtils';
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
    const illustrations = useMemoizedLazyIllustrations(['Luggage'] as const);

    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const step = getTravelStep(policy, travelSettings, isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED), policies, currentUserLogin);

    const mainContent = (() => {
        switch (step) {
            case CONST.TRAVEL.STEPS.BOOK_OR_MANAGE_YOUR_TRIP:
                return <BookOrManageYourTrip policyID={policyID} />;
            case CONST.TRAVEL.STEPS.REVIEWING_REQUEST:
                return <ReviewingRequest />;
            default:
                return <GetStartedTravel policyID={policyID} />;
        }
    })();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceTravelPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={illustrations.Luggage}
                    title={translate('workspace.moreFeatures.travel.title')}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.popToSidebar}
                />
                <ScrollViewWithContext addBottomSafeAreaPadding>
                    <View style={[styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>{mainContent}</View>
                </ScrollViewWithContext>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTravelPage;
