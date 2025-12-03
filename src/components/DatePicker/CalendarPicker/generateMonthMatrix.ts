import {addDays, format, getDay, getDaysInMonth, startOfMonth} from 'date-fns';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

/**
 * Generates a matrix representation of a month's calendar given the year and month.
 *
 * @param year - The year for which to generate the month matrix.
 * @param month - The month (0-indexed) for which to generate the month matrix.
 * @returns A 2D array of the month's calendar days, with null values representing days outside the current month.
 */
export default function generateMonthMatrix(year: number, month: number, locale: Locale = CONST.LOCALES.DEFAULT) {
    if (year < 0) {
        throw new Error('Year cannot be less than 0');
    }
    if (month < 0) {
        throw new Error('Month cannot be less than 0');
    }
    if (month > 11) {
        throw new Error('Month cannot be greater than 11');
    }

    // Get the week day for the end of week
    const weekEndsOn = DateUtils.getWeekEndsOn(locale);

    // Get the number of days in the month and the first day of the month
    const firstDayOfMonth = startOfMonth(new Date(year, month, 1));
    const daysInMonth = getDaysInMonth(firstDayOfMonth);

    // Create a matrix to hold the calendar days
    const matrix = [];
    let currentWeek = [];

    // Add calendar days to the matrix
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = addDays(firstDayOfMonth, i - 1);
        currentWeek.push(Number(format(currentDate, 'd')));

        // Start a new row when the current week is full
        if (getDay(currentDate) === weekEndsOn) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }

    // Add null values for days after the last day of the month
    if (currentWeek.length > 0) {
        for (let i = currentWeek.length; i < 7; i++) {
            currentWeek.push(undefined);
        }
        matrix.push(currentWeek);
    }

    // Add null values for days before the first day of the month
    for (let i = matrix.at(0)?.length ?? 0; i < 7; i++) {
        matrix.at(0)?.unshift(undefined);
    }

    return matrix;
}
