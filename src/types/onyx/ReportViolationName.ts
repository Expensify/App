import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * Names of violations.
 * Derived from `CONST.VIOLATIONS` to maintain a single source of truth.
 */
type ReportViolationName = ValueOf<typeof CONST.REPORT_VIOLATIONS>;

export default ReportViolationName;
