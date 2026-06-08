import React from 'react';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees(props: OnboardingEmployeesProps) {
    return (
        <BaseOnboardingEmployees
            shouldUseNativeStyles
            {...props}
        />
    );
}

export default OnboardingEmployees;
