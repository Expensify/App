import {useMemo} from 'react';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

/**
 * Hook for formatting dates with memoization to improve performance
 * @param dateString - The raw date string to format
 * @param dateFormat - The desired output format (defaults to CONST.DATE.FNS_FORMAT_STRING)
 * @returns The formatted date string
 */
function useFormattedDate(dateString: string | undefined, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING): string {
    return useMemo(() => {
        if (!dateString) {
            return '';
        }
        return DateUtils.formatWithUTCTimeZone(dateString, dateFormat);
    }, [dateString, dateFormat]);
}

export default useFormattedDate;
