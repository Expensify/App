import CONST from '@src/CONST';

import {format} from 'date-fns';

/** Returns the last day the dashboard counts expenses through, as a yyyy-MM-dd string. */
function getInsightsLastDay(asOfDate: string | undefined): string {
    return asOfDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
}

export default getInsightsLastDay;
