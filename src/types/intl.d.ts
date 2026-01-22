/**
 * Represents a day of the week, where:
 * 1 = Monday,
 * 2 = Tuesday,
 * 3 = Wednesday,
 * 4 = Thursday,
 * 5 = Friday,
 * 6 = Saturday,
 * 7 = Sunday.
 */
type WeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type WeekInfo = {
    firstDay: WeekDay;
    weekend: [WeekDay, WeekDay];
    minimalDays?: number;
};

declare namespace Intl {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locale {
        getWeekInfo(): WeekInfo;
        weekInfo: WeekInfo;
    }
}
