import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import EmbeddedDemo from '@components/EmbeddedDemo';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import {shouldOpenRHPVariant} from '@components/SidePanel/RHPVariantTest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeTestDriveTask} from '@libs/actions/Task';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
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
    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const {testDrive} = useOnboardingMessages();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const parentReportAction = useParentReportAction(viewTourTaskReport);
    const isCurrentUserPolicyAdmin = useIsPaidPolicyAdmin();

    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
    });

    useEffect(() => {
        if (hasSeenTour || !viewTourTaskReport || viewTourTaskReport.stateNum === CONST.REPORT.STATE_NUM.APPROVED) {
            return;
        }

        completeTestDriveTask(
            viewTourTaskReport,
            viewTourTaskParentReport,
            isViewTourTaskParentReportArchived,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
            false,
        );
    }, [hasSeenTour, viewTourTaskReport, viewTourTaskParentReport, isViewTourTaskParentReportArchived, currentUserPersonalDetails.accountID, hasOutstandingChildTask, parentReportAction]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setIsVisible(true);
        });
    }, []);

    const closeModal = useCallback(() => {
        setIsVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            Navigation.goBack();

            if (shouldOpenRHPVariant()) {
                Log.hmmm('[AdminTestDriveModal] User was redirected to Workspace Editor, skipping navigation to admin room');
                return;
            }
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
                >
                    <TestDriveBanner onPress={closeModal} />
                    <FullPageOfflineBlockingView>
                        <EmbeddedDemo
                            url={getTestDriveURL(shouldUseNarrowLayout, introSelected, isCurrentUserPolicyAdmin)}
                            iframeTitle={testDrive.EMBEDDED_DEMO_IFRAME_TITLE}
                        />
                    </FullPageOfflineBlockingView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

export default TestDriveDemo;
