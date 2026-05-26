import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useRootNavigationState from '@hooks/useRootNavigationState';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {LHNTooltipContext} from './LHNTooltipContext';

type LHNTooltipContextProviderProps = {
    data: Report[];
    children: React.ReactNode;
};

function LHNTooltipContextProvider({data, children}: LHNTooltipContextProviderProps) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [isFullscreenVisible] = useOnyx(ONYXKEYS.FULLSCREEN_VISIBILITY);
    const reportAttributes = useReportAttributes();

    const firstReport = data.find((report) => {
        const attrs = reportAttributes?.[report.reportID];
        if (!isEmptyObject(attrs?.reportErrors)) {
            return true;
        }
        return attrs?.requiresAttention;
    });
    const firstReportIDWithGBRorRBR = firstReport?.reportID;

    const isScreenFocused = useIsFocused();
    const isReportsSplitNavigatorLast = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

    const value = {
        onboardingPurpose: introSelected?.choice,
        onboarding,
        isFullscreenVisible,
        firstReportIDWithGBRorRBR,
        isScreenFocused,
        isReportsSplitNavigatorLast,
    };

    return <LHNTooltipContext.Provider value={value}>{children}</LHNTooltipContext.Provider>;
}

export default LHNTooltipContextProvider;
