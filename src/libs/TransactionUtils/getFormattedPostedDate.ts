function getFormattedPostedDate(posted?: string): string {
    if (!posted) {
        return '';
    }
    // Some card feeds (e.g. Amex) send posted as YYYYMMDDHHmmss instead of YYYYMMDD.
    // Accept the optional 6-digit time suffix; it is dropped below because we only show the date.
    if (!/^\d{8}(\d{6})?$/.test(posted)) {
        return posted;
    }
    return `${posted.slice(0, 4)}-${posted.slice(4, 6)}-${posted.slice(6, 8)}`;
}

export default getFormattedPostedDate;
