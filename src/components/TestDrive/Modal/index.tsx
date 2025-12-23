import React from 'react';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AdminTestDriveModal from './AdminTestDriveModal';
import EmployeeTestDriveModal from './EmployeeTestDriveModal';

function TestDriveModal() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const isAdminTester = introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM || introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE;

    return isAdminTester ? <AdminTestDriveModal /> : <EmployeeTestDriveModal />;
}

export default TestDriveModal;
