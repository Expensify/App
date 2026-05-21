import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import {shouldOpenRHPVariant} from '@components/SidePanel/RHPVariantTest';
import getTestDriveAdminRoomReport from '@components/TestDrive/getTestDriveAdminRoomReport';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseTestDriveModal from './BaseTestDriveModal';

function AdminTestDriveModal() {
    const {translate} = useLocalize();
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onboarding?.chatReportID}`);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingAdminsChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onboardingAdminsChatReportID}`, undefined, [onboardingAdminsChatReportID]);
    const {taskParentReport: viewTourTaskParentReport} = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const adminRoomReport = getTestDriveAdminRoomReport(viewTourTaskParentReport, onboardingAdminsChatReport, onboardingReport);

    const navigate = () => {
        Log.hmmm('[AdminTestDriveModal] Navigate function called');
        InteractionManager.runAfterInteractions(() => {
            Log.hmmm('[AdminTestDriveModal] Calling Navigation.navigate()');
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        });
    };

    const skipTestDrive = () => {
        Log.hmmm('[AdminTestDriveModal] Skip test drive function called');
        Navigation.dismissModal();

        if (shouldOpenRHPVariant()) {
            Log.hmmm('[AdminTestDriveModal] User was redirected to Workspace Editor, skipping navigation to admin room');
            return;
        }

        Log.hmmm('[AdminTestDriveModal] Running after interactions');
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (!adminRoomReport) {
                Log.hmmm('[AdminTestDriveModal] Not an admin room');
                return;
            }

            Log.hmmm('[AdminTestDriveModal] Navigating to report', {reportID: adminRoomReport.reportID});
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminRoomReport.reportID));
        });
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.description')}
            onConfirm={navigate}
            onHelp={skipTestDrive}
            shouldCallOnHelpWhenModalHidden
        />
    );
}

export default AdminTestDriveModal;
