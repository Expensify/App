import React from 'react';
import BaseOnboardingEmployees from './BaseOnboardingEmployees';
import type {OnboardingEmployeesProps} from './types';

function OnboardingEmployees({...rest}: OnboardingEmployeesProps) {
    return (
        <BaseOnboardingEmployees
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingEmployees.displayName = 'OnboardingEmployees';

export default OnboardingEmployees;
