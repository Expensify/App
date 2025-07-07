import Timing from '@libs/actions/Timing';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';

/**
 * Mark all 'open_report*' performance events as finished using both Performance (local) and Timing (remote) tracking.
 */
function markOpenReportEnd() {
    Performance.markEnd(CONST.TIMING.OPEN_REPORT);
    Timing.end(CONST.TIMING.OPEN_REPORT);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_THREAD);
    Timing.end(CONST.TIMING.OPEN_REPORT_THREAD);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
    Timing.end(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_SEARCH);
    Timing.end(CONST.TIMING.OPEN_REPORT_SEARCH);
}

export default markOpenReportEnd;
