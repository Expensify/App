/** Returns whether a period starts after today */
function isPeriodAfterToday(periodStart: string, today: string, dateFilterStart?: string): boolean {
    // A date filter that starts partway through a group starts the group there too, e.g. Oct 10 for a range from Oct 10 to Dec 31
    const start = dateFilterStart && dateFilterStart > periodStart ? dateFilterStart : periodStart;
    return start > today;
}

export default isPeriodAfterToday;
