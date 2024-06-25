import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ReportViolationName = ValueOf<typeof CONST.REPORT_VIOLATIONS>;

/**
 * Report Violation model
 */
type ReportViolations = Record<ReportViolationName, Record<string, Record<string, unknown>>>;

export type {ReportViolationName};
export default ReportViolations;
