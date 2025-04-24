/**
 * The attributes of a report.
 */
type ReportAttributes = {
    /**
     * The name of the report.
     */
    reportName: string;
};

/**
 * The derived value for report attributes.
 */
type ReportAttributesDerivedValue = {
    /**
     * The report attributes.
     */
    reports: Record<string, ReportAttributes>;
    /**
     * The locale used to compute the report attributes.
     */
    locale: string | null;
};

export default ReportAttributesDerivedValue;
export type {ReportAttributes};
