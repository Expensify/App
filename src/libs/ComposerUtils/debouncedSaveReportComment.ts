import debounce from 'lodash/debounce';
import * as Report from '../actions/Report';

/**
 * Save draft report comment. Debounced to happen at most once per second.
 */
const debouncedSaveReportComment = debounce((reportID: string, comment = '') => {
    Report.saveReportComment(reportID, comment);
}, 1000);

export default debouncedSaveReportComment;
