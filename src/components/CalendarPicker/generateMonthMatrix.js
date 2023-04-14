import moment from 'moment';
import CONST from '../../CONST';

/**
 * Generates a matrix representation of a month's calendar given the year and month.
 *
 * @param {Number} year - The year for which to generate the month matrix.
 * @param {Number} month - The month (0-indexed) for which to generate the month matrix.
 * @returns {Array<Array<Number|null>>} - A 2D array of the month's calendar days, with null values representing days outside the current month.
 */
export default function generateMonthMatrix(year, month) {
    if (typeof year !== 'number') {
        throw new TypeError('Year must be a number');
    }
    if (year < 0) {
        throw new Error('Year cannot be less than 0');
    }
    if (typeof month !== 'number') {
        throw new TypeError('Month must be a number');
    }
    if (month < 0) {
        throw new Error('Month cannot be less than 0');
    }
    if (month > 11) {
        throw new Error('Month cannot be greater than 11');
    }

    // Get the number of days in the month and the first day of the month
    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]).locale(CONST.LOCALES.EN);

    // Create a matrix to hold the calendar days
    const matrix = [];
    let currentWeek = [];

    // Add null values for days before the first day of the month
    for (let i = 0; i < firstDay.weekday(); i++) {
        currentWeek.push(null);
    }

    // Add calendar days to the matrix
    for (let i = 1; i <= daysInMonth; i++) {
        const day = moment([year, month, i]).locale(CONST.LOCALES.EN);
        currentWeek.push(day.date());

        // Start a new row when the current week is full
        if (day.weekday() === 6) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }

    // Add null values for days after the last day of the month
    if (currentWeek.length > 0) {
        for (let i = currentWeek.length; i < 7; i++) {
            currentWeek.push(null);
        }
        matrix.push(currentWeek);
    }
    return matrix;
}
