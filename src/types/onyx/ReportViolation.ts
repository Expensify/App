import type {EmptyObject, ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ReportViolationName = ValueOf<typeof CONST.REPORT_VIOLATIONS>;

/**
 * Keys of this object are IDs of field that has violations
 */
type ReportFieldsViolations = Record<string, EmptyObject>;

/**
 * Report Violation model
 */
type ReportViolations = Record<ReportViolationName, ReportFieldsViolations>;

export type {ReportViolationName, ReportFieldsViolations};
export default ReportViolations;
