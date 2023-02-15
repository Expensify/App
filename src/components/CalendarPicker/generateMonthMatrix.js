import moment from 'moment';

/**
 * Generates a matrix representation of a month's calendar given the year and month.
 * @param {number} year - The year for which to generate the month matrix.
 * @param {number} month - The month (0-indexed) for which to generate the month matrix.
 * @returns {Array.<Array.<number|null>>} - A 2D array of the month's calendar days, with null values representing days outside the current month.
 */
export default function generateMonthMatrix(year, month) {
    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]).startOf('month').locale('en');
    const matrix = [];
    let currentWeek = [];
    for (let i = 0; i < firstDay.weekday(); i++) {
        currentWeek.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const day = moment([year, month, i]).locale('en');
        currentWeek.push(day.date());
        if (day.weekday() === 6) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        for (let i = currentWeek.length; i < 7; i++) {
            currentWeek.push(null);
        }
        matrix.push(currentWeek);
    }
    return matrix;
}
