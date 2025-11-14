import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isChatUsedForOnboarding} from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected} from '@src/types/onyx';

const onboardingPurposeSelector = (introSelected: OnyxEntry<IntroSelected>) => introSelected?.choice;

function OptionRowFreeTrial({reportID}: {reportID: string}) {
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [onboardingPurpose] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true, selector: onboardingPurposeSelector});

    const isChatForOnboarding = isChatUsedForOnboarding(report, onboardingPurpose);

    if (!isChatForOnboarding) {
        return null;
    }

    return <FreeTrial badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1, styles.flexShrink1]} />;
}

export default OptionRowFreeTrial;
