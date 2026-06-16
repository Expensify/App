import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useCurrentTimezone(): SelectedTimezone {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    return DateUtils.getCurrentTimezone(currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE).selected;
}

export default useCurrentTimezone;
