import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 *
 */
type ReportViolation = ValueOf<typeof CONST.REPORT_VIOLATIONS>;

/**
 *
 */
type ReportViolations = Record<ReportViolation, Record<string, Record<string, unknown> | null>>;

export type {ReportViolation};
export default ReportViolations;
