import React from 'react';
import useOnyx from '@hooks/useOnyx';
import isTrackOnboardingChoice from '@libs/OnboardingUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AdminTestDriveModal from './AdminTestDriveModal';
import EmployeeTestDriveModal from './EmployeeTestDriveModal';

function TestDriveModal() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const isAdminTester = introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM || isTrackOnboardingChoice(introSelected?.choice);

    return isAdminTester ? <AdminTestDriveModal /> : <EmployeeTestDriveModal />;
}

export default TestDriveModal;
