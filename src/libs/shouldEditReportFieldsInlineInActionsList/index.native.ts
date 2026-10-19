import type ShouldEditReportFieldsInlineInActionsList from './types';

// The report actions list is inverted. When the keyboard opens for an input inside it, the native apps scroll the list
// away from the input, so report fields shown in that list open the report field editor page instead.
const shouldEditReportFieldsInlineInActionsList: ShouldEditReportFieldsInlineInActionsList = () => false;

export default shouldEditReportFieldsInlineInActionsList;
