import {createContext, useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {Onboarding, OnboardingPurpose} from '@src/types/onyx';

type LHNTooltipContextValue = {
    onboardingPurpose: OnboardingPurpose | undefined;
    onboarding: OnyxEntry<Onboarding>;
    isFullscreenVisible: boolean | undefined;
    firstReportIDWithGBRorRBR: string | undefined;
};

const LHNTooltipContext = createContext<LHNTooltipContextValue>({
    onboardingPurpose: undefined,
    onboarding: undefined,
    isFullscreenVisible: undefined,
    firstReportIDWithGBRorRBR: undefined,
});

function useLHNTooltipContext(): LHNTooltipContextValue {
    return useContext(LHNTooltipContext);
}

export {LHNTooltipContext, useLHNTooltipContext};
export type {LHNTooltipContextValue};
