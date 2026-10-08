// Parity fixture for the homemade plugin production ships at
// config/eslint/plugins/eslint-plugin-report-name-utils.mjs, which oxlint loads through its JS
// sidecar. The rule fires on any CallExpression inside a FunctionDeclaration named getReportName;
// computeReportName below is the control, a function where computation does belong.

export function computeReportName(reportID: string): string {
    return `report:${reportID}`;
}

export function getReportName(reportID: string): string {
    return computeReportName(reportID);
}
