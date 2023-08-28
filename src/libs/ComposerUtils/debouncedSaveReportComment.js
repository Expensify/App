import _ from 'underscore';
import * as Report from '../actions/Report';

/**
 * Save draft report comment. Debounced to happen at most once per second.
 * @param {String} reportID
 * @param {String} comment
 */
const debouncedSaveReportComment = _.debounce((reportID, comment) => {
    Report.saveReportComment(reportID, comment || '');
}, 1000);

export default debouncedSaveReportComment;
