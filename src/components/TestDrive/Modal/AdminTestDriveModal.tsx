import React, {useRef} from 'react';
import {InteractionManager} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import BaseTestDriveModal from './BaseTestDriveModal';

function AdminTestDriveModal() {
    const {translate} = useLocalize();
    const actionToPerformRef = useRef<'dismiss' | 'navigate_demo'>('dismiss');

    const dismiss = (closeModal: () => void) => {
        actionToPerformRef.current = 'dismiss';
        closeModal();
    };

    const confirm = (closeModal: () => void) => {
        actionToPerformRef.current = 'navigate_demo';
        closeModal();
    };

    const navigate = () => {
        switch (actionToPerformRef.current) {
            case 'navigate_demo': {
                InteractionManager.runAfterInteractions(() => {
                    Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
                });
                break;
            }
            default: {
                // do nothing
            }
        }
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.description')}
            onHelp={dismiss}
            onConfirm={confirm}
            onClose={navigate}
        />
    );
}

AdminTestDriveModal.displayName = 'AdminTestDriveModal';

export default AdminTestDriveModal;
