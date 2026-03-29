import type ReportViolationName from './ReportViolationName';

/** Record mapping violation names to objects keyed by report field IDs */
type ReportViolations = Partial<Record<ReportViolationName, Record<string, boolean>>>;

export default ReportViolations;
