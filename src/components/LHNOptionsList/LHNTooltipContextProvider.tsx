import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useRootNavigationState from '@hooks/useRootNavigationState';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

import {LHNTooltipActionsContext, LHNTooltipContext, LHNTooltipVisibilityContext} from './LHNTooltipContext';
import useLHNRowProductTrainingTooltip from './OptionRowLHN/useLHNRowProductTrainingTooltip';

type LHNTooltipContextProviderProps = {
    /** The ordered IDs of the reports rendered in the LHN */
    data: string[];
    children: React.ReactNode;
};

type LHNTooltipRowContextProviderProps = LHNTooltipContextProviderProps & {
    /** Whether the LHN screen is focused. Rows only read it through a getter, so a focus change does not re-render them. */
    isScreenFocused: boolean;
};

/**
 * Provides the contexts every row reads. Their values must not change when the LHN screen loses focus (for example when an RHP opens),
 * so focus and the tooltip hide action are exposed as getters backed by refs.
 */
function LHNTooltipRowContextProvider({data, isScreenFocused, children}: LHNTooltipRowContextProviderProps) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const reportAttributes = useReportAttributes();
    const {hideProductTrainingTooltip} = useLHNRowProductTrainingTooltip();
    const isScreenFocusedRef = useRef(isScreenFocused);
    const hideProductTrainingTooltipRef = useRef(hideProductTrainingTooltip);

    useEffect(() => {
        isScreenFocusedRef.current = isScreenFocused;
        hideProductTrainingTooltipRef.current = hideProductTrainingTooltip;
    });

    const firstReportIDWithGBRorRBR = data.find((reportID) => {
        const attrs = reportAttributes?.[reportID];
        if (!isEmptyObject(attrs?.reportErrors)) {
            return true;
        }
        return attrs?.requiresAttention;
    });

    const value = {
        onboardingPurpose: introSelected?.choice,
        onboarding,
        firstReportIDWithGBRorRBR,
    };

    const actions = {
        hideConciergeTooltip: () => hideProductTrainingTooltipRef.current(),
        getIsScreenFocused: () => isScreenFocusedRef.current,
    };

    return (
        <LHNTooltipActionsContext.Provider value={actions}>
            <LHNTooltipContext.Provider value={value}>{children}</LHNTooltipContext.Provider>
        </LHNTooltipActionsContext.Provider>
    );
}

function LHNTooltipContextProvider({data, children}: LHNTooltipContextProviderProps) {
    const isScreenFocused = useIsFocused();
    const isReportsSplitNavigatorLast = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    const [isFullscreenVisible] = useOnyx(ONYXKEYS.FULLSCREEN_VISIBILITY);

    const visibilityValue = {
        isFullscreenVisible,
        isScreenFocused,
        isReportsSplitNavigatorLast,
    };

    return (
        <LHNTooltipVisibilityContext.Provider value={visibilityValue}>
            <LHNTooltipRowContextProvider
                data={data}
                isScreenFocused={isScreenFocused}
            >
                {children}
            </LHNTooltipRowContextProvider>
        </LHNTooltipVisibilityContext.Provider>
    );
}

export default LHNTooltipContextProvider;
