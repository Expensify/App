import React from 'react';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AdminTestDriveModal from './AdminTestDriveModal';
import EmployeeTestDriveModal from './EmployeeTestDriveModal';

function TestDriveModal() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: false});
    const isAdminTester = introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM;

    return isAdminTester ? <AdminTestDriveModal /> : <EmployeeTestDriveModal />;
}

TestDriveModal.displayName = 'TestDriveModal';

export default TestDriveModal;
