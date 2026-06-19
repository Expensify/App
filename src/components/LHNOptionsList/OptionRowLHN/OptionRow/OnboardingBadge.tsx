import React from 'react';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import {isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils} from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import ONYXKEYS from '@src/ONYXKEYS';

type OnboardingBadgeProps = {
    /** The option data for the report row this badge belongs to. Used to determine whether the report is the onboarding chat. */
    optionItem: OptionData;
};

function OnboardingBadge({optionItem}: OnboardingBadgeProps) {
    const styles = useThemeStyles();
    const {onboarding, onboardingPurpose} = useLHNTooltipContext();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    if (!isChatUsedForOnboardingReportUtils(optionItem, onboarding, conciergeReportID, onboardingPurpose)) {
        return null;
    }

    return <FreeTrial badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1, styles.flexShrink1]} />;
}

OnboardingBadge.displayName = 'OptionRow.OnboardingBadge';

export default OnboardingBadge;
