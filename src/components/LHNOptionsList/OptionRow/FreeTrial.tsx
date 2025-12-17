import React, {use} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isChatUsedForOnboarding} from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected} from '@src/types/onyx';
import { OptionRowContext } from './Provider';

const onboardingPurposeSelector = (introSelected: OnyxEntry<IntroSelected>) => introSelected?.choice;

function OptionRowFreeTrial() {
    const {state: {reportID}} = use(OptionRowContext);
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [onboardingPurpose] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true, selector: onboardingPurposeSelector});

    // TODO the check here is expensive and unnecessary for 99% of cases, we need to think how to make it more efficient
    // We could very likely skip subscribing to the entire report object
    const isChatForOnboarding = isChatUsedForOnboarding(report, onboardingPurpose);

    if (!isChatForOnboarding) {
        return null;
    }

    return <FreeTrial badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1, styles.flexShrink1]} />;
}

export default OptionRowFreeTrial;
