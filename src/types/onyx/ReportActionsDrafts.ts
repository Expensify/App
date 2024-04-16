import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type ReportActionsDraft from './ReportActionsDraft';

type ReportActionsDrafts = Record<string, ReportActionsDraft>;

type ReportActionsDraftCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS>;

export default ReportActionsDrafts;
export type {ReportActionsDraftCollectionDataSet};
