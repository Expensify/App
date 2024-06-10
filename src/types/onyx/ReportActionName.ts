import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

/**
 *
 */
type ReportActionName = DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;

export default ReportActionName;
