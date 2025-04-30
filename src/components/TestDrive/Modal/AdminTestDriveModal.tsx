import React from 'react';
import {InteractionManager} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import BaseTestDriveModal from './BaseTestDriveModal';

function AdminTestDriveModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const navigate = () => {
        InteractionManager.runAfterInteractions(() => {
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        });
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.description')}
            onConfirm={navigate}
            contentInnerContainerStyles={styles.gap3}
        />
    );
}

AdminTestDriveModal.displayName = 'AdminTestDriveModal';

export default AdminTestDriveModal;
