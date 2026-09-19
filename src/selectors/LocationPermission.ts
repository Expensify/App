import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {OnyxEntry} from 'react-native-onyx';

import {isValid} from 'date-fns';

/**
 * Selector to derive whether we should start the location permission flow from the last prompt timestamp.
 * Returns true when the user has never been prompted, or when the last prompt was more than LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS ago.
 */
function shouldStartLocationPermissionFlowSelector(lastLocationPermissionPrompt: OnyxEntry<string>): boolean {
    if (!lastLocationPermissionPrompt) {
        return true;
    }
    // The NVP is written as an instant via `toISOString`, so an unzoned echo from the backend is UTC, not local wall-clock.
    const promptedAt = DateUtils.toUTCDate(lastLocationPermissionPrompt);
    return isValid(promptedAt) && DateUtils.getDifferenceInDaysFromNow(promptedAt) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS;
}

export default shouldStartLocationPermissionFlowSelector;
