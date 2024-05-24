import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ReportActionsPages = Array<ValueOf<typeof CONST.PAGE_MARKER> | [string, string]>;

export default ReportActionsPages;
