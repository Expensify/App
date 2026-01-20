import React from 'react';
import {InteractionManager} from 'react-native';
import {shouldOpenRHPVariant} from '@components/SidePanel/RHPVariantTest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {isAdminRoom} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseTestDriveModal from './BaseTestDriveModal';

function AdminTestDriveModal() {
    const {translate} = useLocalize();
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: false});
    const [onboardingReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onboarding?.chatReportID}`, {canBeMissing: true});

    const navigate = () => {
        Log.hmmm('[AdminTestDriveModal] Navigate function called');
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            if (!isAdminRoom(onboardingReport)) {
                Log.hmmm('[AdminTestDriveModal] Not an admin room');
                return;
            }

            Log.hmmm('[AdminTestDriveModal] Navigating to report', {reportID: onboardingReport?.reportID});
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(onboardingReport?.reportID));
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
