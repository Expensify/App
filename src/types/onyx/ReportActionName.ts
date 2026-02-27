import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

/** The name (or type) of a reportAction */
type ReportActionName = DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;

export default ReportActionName;
