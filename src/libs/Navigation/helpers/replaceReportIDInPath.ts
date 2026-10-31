const REPORT_ID_ROUTE_SEGMENTS = ['r', 'e', 'search/r', 'search/view'];

function escapeForRegExp(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replace whole report IDs in report paths, explicit reportID parameters, and nested encoded backTo paths. */
function replaceReportIDInPath(path: string, oldReportID: string, newReportID: string): string {
    const pattern = new RegExp(`(^|/)(${REPORT_ID_ROUTE_SEGMENTS.map(escapeForRegExp).join('|')})/${escapeForRegExp(oldReportID)}(?=$|[/?#])`, 'g');
    const reportIDParamPattern = new RegExp(`([?&]reportID=)${escapeForRegExp(encodeURIComponent(oldReportID))}(?=$|[&#])`, 'g');
    return path
        .replaceAll(pattern, `$1$2/${newReportID}`)
        .replaceAll(reportIDParamPattern, `$1${encodeURIComponent(newReportID)}`)
        .replaceAll(/([?&]backTo=)([^&#]*)/g, (match: string, prefix: string, encodedBackTo: string) => {
            try {
                const backTo = decodeURIComponent(encodedBackTo);
                const updatedBackTo = replaceReportIDInPath(backTo, oldReportID, newReportID);
                return updatedBackTo === backTo ? match : `${prefix}${encodeURIComponent(updatedBackTo)}`;
            } catch {
                // A malformed escape must not prevent other routes from being redirected.
                return match;
            }
        });
}

export default replaceReportIDInPath;
