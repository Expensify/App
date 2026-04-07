import React, {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
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

    const firstReportIDWithGBRorRBR = useMemo(() => {
        const firstReport = data.find((report) => {
            const attrs = reportAttributes?.[report.reportID];
            if (!isEmptyObject(attrs?.reportErrors)) {
                return true;
            }
            return attrs?.requiresAttention;
        });
        return firstReport?.reportID;
    }, [data, reportAttributes]);

    const value = useMemo(
        () => ({
            onboardingPurpose: introSelected?.choice,
            onboarding,
            isFullscreenVisible,
            firstReportIDWithGBRorRBR,
        }),
        [introSelected?.choice, onboarding, isFullscreenVisible, firstReportIDWithGBRorRBR],
    );

    return <LHNTooltipContext.Provider value={value}>{children}</LHNTooltipContext.Provider>;
}

export default LHNTooltipContextProvider;
