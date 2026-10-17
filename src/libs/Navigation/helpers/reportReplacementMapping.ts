/** Keep replacements for this session: browser history can restore a route after its optimistic report has been deleted. */
const reportReplacements = new Map<string, string>();

function resolveReplacementReportID(reportID: string): string {
    let resolvedReportID = reportID;
    const visited = new Set<string>();
    while (reportReplacements.has(resolvedReportID) && !visited.has(resolvedReportID)) {
        visited.add(resolvedReportID);
        resolvedReportID = reportReplacements.get(resolvedReportID) ?? resolvedReportID;
    }
    return resolvedReportID;
}

function registerReportReplacement(fromReportID: string, toReportID: string) {
    const destination = resolveReplacementReportID(toReportID);
    if (!fromReportID || !destination || fromReportID === destination) {
        return;
    }
    reportReplacements.set(fromReportID, destination);
}

function getReportReplacements(): ReadonlyMap<string, string> {
    return reportReplacements;
}

export {registerReportReplacement, resolveReplacementReportID, getReportReplacements};
