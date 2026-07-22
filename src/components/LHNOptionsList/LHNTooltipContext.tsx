import type {Onboarding, OnboardingPurpose} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {createContext, useContext} from 'react';

type LHNTooltipContextValue = {
    onboardingPurpose: OnboardingPurpose | undefined;
    onboarding: OnyxEntry<Onboarding>;
    isFullscreenVisible: boolean | undefined;
    firstReportIDWithGBRorRBR: string | undefined;
    isScreenFocused: boolean;
    isReportsSplitNavigatorLast: boolean;
};

const LHNTooltipContext = createContext<LHNTooltipContextValue>({
    onboardingPurpose: undefined,
    onboarding: undefined,
    isFullscreenVisible: undefined,
    firstReportIDWithGBRorRBR: undefined,
    isScreenFocused: false,
    isReportsSplitNavigatorLast: false,
});

function useLHNTooltipContext(): LHNTooltipContextValue {
    return useContext(LHNTooltipContext);
}

export {LHNTooltipContext, useLHNTooltipContext};
