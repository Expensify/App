import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type ReportActionsDraft from './ReportActionsDraft';

/** Record of report actions drafts, indexed by their ID */
type ReportActionsDrafts = Record<string, ReportActionsDraft>;

/** Record of report actions drafts grouped by report, indexed by reportActionsDrafts_\<REPORT_ID\> */
type ReportActionsDraftCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS>;

export default ReportActionsDrafts;
export type {ReportActionsDraftCollectionDataSet};
