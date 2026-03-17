import React from 'react';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees(props: OnboardingEmployeesProps) {
    return (
        <BaseOnboardingEmployees
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default OnboardingEmployees;
