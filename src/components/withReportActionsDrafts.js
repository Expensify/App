import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';

const context = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
export const ReportActionsDraftsProvider = context.Provider;
export default context.withOnyxKey;
