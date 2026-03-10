import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

/**
 * Selector to derive whether we should start the location permission flow from the last prompt timestamp.
 * Returns true when the user has never been prompted, or when the last prompt was more than LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS ago.
 */
function shouldStartLocationPermissionFlowSelector(lastLocationPermissionPrompt: OnyxEntry<string>): boolean {
    return (
        !lastLocationPermissionPrompt ||
        (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
            DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS)
    );
}

export {shouldStartLocationPermissionFlowSelector};
