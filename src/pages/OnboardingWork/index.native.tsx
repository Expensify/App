import React from 'react';
import BaseOnboardingWork from './BaseOnboardingWork';
import type {OnboardingWorkProps} from './types';

function OnboardingWork({...rest}: Omit<OnboardingWorkProps, 'shouldUseNativeStyles'>) {
    return (
        <BaseOnboardingWork
            shouldUseNativeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

OnboardingWork.displayName = 'OnboardingWork';

export default OnboardingWork;
