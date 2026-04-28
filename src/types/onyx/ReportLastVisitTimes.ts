/**
 * Map of reportID → ISO/DB timestamp recording when the user last visited that report.
 *
 * Consumed only by `findLastAccessedReport` / `getMostRecentlyVisitedReport` in
 * `ReportUtils.ts` for navigation fallback (deeplink without reportID, post-delete,
 * post-onboarding). Kept out of per-report metadata because every report open
 * writes here, and no report-level UI subscribes to this signal.
 */
type ReportLastVisitTimes = Record<string, string>;

export default ReportLastVisitTimes;
