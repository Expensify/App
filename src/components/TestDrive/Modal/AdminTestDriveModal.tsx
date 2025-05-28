import React from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
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
        InteractionManager.runAfterInteractions(() => {
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        });
    };

    const skipTestDrive = () => {
        Navigation.dismissModal();
        InteractionManager.runAfterInteractions(() => {
            if (!isAdminRoom(onboardingReport)) {
                return;
            }

            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(onboardingReport?.reportID));
        });
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.description')}
            onConfirm={navigate}
            onHelp={skipTestDrive}
        />
    );
}

AdminTestDriveModal.displayName = 'AdminTestDriveModal';

export default AdminTestDriveModal;
