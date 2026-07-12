/** Card posted dates are stored raw as `YYYYMMDD` (which `new Date()` treats as invalid); convert to `YYYY-MM-DD`. Already-ISO or empty values pass through. */
function getFormattedPostedDate(posted?: string): string {
    if (!posted) {
        return '';
    }
    if (!/^\d{8}$/.test(posted)) {
        return posted;
    }
    return `${posted.slice(0, 4)}-${posted.slice(4, 6)}-${posted.slice(6, 8)}`;
}

export default getFormattedPostedDate;
