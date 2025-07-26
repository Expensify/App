import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useIOUUtils() {
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    function shouldStartLocationPermissionFlow() {
        return (
            !lastLocationPermissionPrompt ||
            (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS)
        );
    }

    return {shouldStartLocationPermissionFlow};
}

export default useIOUUtils;
