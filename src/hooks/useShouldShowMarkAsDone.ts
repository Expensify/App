import {shouldShowMarkAsDone} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import useOnyx from './useOnyx';

/**
 * Whether submission actions for this report should use the "Mark as done" copy instead of "Submit".
 */
function useShouldShowMarkAsDone(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>): boolean {
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    return shouldShowMarkAsDone({isTrackIntentUser, report, policy});
}

export default useShouldShowMarkAsDone;
