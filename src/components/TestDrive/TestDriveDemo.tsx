import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import EmbeddedDemo from '@components/EmbeddedDemo';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeTestDriveTask} from '@libs/actions/Task';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isUserPolicyAdmin} from '@libs/PolicyUtils';
import {isAdminRoom} from '@libs/ReportUtils';
import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import TestDriveBanner from './TestDriveBanner';

function TestDriveDemo() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isVisible, setIsVisible] = useState(false);
    const styles = useThemeStyles();
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: false});
    const [onboardingReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onboarding?.chatReportID}`, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const viewTourReportID = introSelected?.viewTour;
    const [viewTourReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourReportID}`, {canBeMissing: true});
    const {testDrive} = useOnboardingMessages();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isPolicyAdmin = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: (policies) => Object.values(policies ?? {}).some((policy) => isPaidGroupPolicy(policy) && isUserPolicyAdmin(policy, currentUserPersonalDetails.login)),
    });

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsVisible(true);
            completeTestDriveTask(viewTourReport, viewTourReportID);
        });

        // This should fire only during mount.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closeModal = useCallback(() => {
        setIsVisible(false);
        InteractionManager.runAfterInteractions(() => {
            Navigation.goBack();

            if (isAdminRoom(onboardingReport)) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(onboardingReport?.reportID));
            }
        });
    }, [onboardingReport]);

    return (
        <SafeAreaConsumer>
            {({paddingTop, paddingBottom}) => (
                <Modal
                    isVisible={isVisible}
                    onClose={closeModal}
                    type={CONST.MODAL.MODAL_TYPE.FULLSCREEN}
                    style={styles.backgroundWhite}
                    innerContainerStyle={{...styles.flex1, marginTop: paddingTop, marginBottom: paddingBottom}}
                    useNativeDriver={false} // We need to disable native driver in order to prevent https://github.com/Expensify/App/issues/61032
                >
                    <TestDriveBanner onPress={closeModal} />
                    <FullPageOfflineBlockingView>
                        <EmbeddedDemo
                            url={getTestDriveURL(shouldUseNarrowLayout, introSelected, isPolicyAdmin)}
                            iframeTitle={testDrive.EMBEDDED_DEMO_IFRAME_TITLE}
                        />
                    </FullPageOfflineBlockingView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

TestDriveDemo.displayName = 'TestDriveDemo';

export default TestDriveDemo;
