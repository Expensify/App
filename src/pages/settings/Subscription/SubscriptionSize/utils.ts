import {addMonths, format, startOfMonth} from 'date-fns';
import CONST from '@src/CONST';

const getNewSubscriptionRenewalDate = (): string => format(startOfMonth(addMonths(new Date(), 12)), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);

export default getNewSubscriptionRenewalDate;
