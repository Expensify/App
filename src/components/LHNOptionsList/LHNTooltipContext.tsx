import type {Onboarding, OnboardingPurpose} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {createContext, useContext} from 'react';

type LHNTooltipContextValue = {
    onboardingPurpose: OnboardingPurpose | undefined;
    onboarding: OnyxEntry<Onboarding>;
    firstReportIDWithGBRorRBR: string | undefined;
};

/** Rows call these on press. The value never changes, so reading it never re-renders a row. */
type LHNTooltipActionsContextValue = {
    hideProductTrainingTooltip: () => void;
    getIsScreenFocused: () => boolean;
};

/** Changes when the LHN screen gains or loses focus, so only the row that renders the tooltip reads it. */
type LHNTooltipVisibilityContextValue = {
    isFullscreenVisible: boolean | undefined;
    isScreenFocused: boolean;
    isReportsSplitNavigatorLast: boolean;
};

const LHNTooltipContext = createContext<LHNTooltipContextValue>({
    onboardingPurpose: undefined,
    onboarding: undefined,
    firstReportIDWithGBRorRBR: undefined,
});

const LHNTooltipActionsContext = createContext<LHNTooltipActionsContextValue>({
    hideProductTrainingTooltip: () => {},
    getIsScreenFocused: () => false,
});

const LHNTooltipVisibilityContext = createContext<LHNTooltipVisibilityContextValue>({
    isFullscreenVisible: undefined,
    isScreenFocused: false,
    isReportsSplitNavigatorLast: false,
});

function useLHNTooltipContext(): LHNTooltipContextValue {
    return useContext(LHNTooltipContext);
}

function useLHNTooltipActionsContext(): LHNTooltipActionsContextValue {
    return useContext(LHNTooltipActionsContext);
}

function useLHNTooltipVisibilityContext(): LHNTooltipVisibilityContextValue {
    return useContext(LHNTooltipVisibilityContext);
}

export {LHNTooltipContext, LHNTooltipActionsContext, LHNTooltipVisibilityContext, useLHNTooltipContext, useLHNTooltipActionsContext, useLHNTooltipVisibilityContext};
