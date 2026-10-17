import {useReportActionActiveEdit} from './ReportActionEditMessageContext';
import useShouldEditInComposer from './useShouldEditInComposer';

/** Narrow-screen edits use the bottom composer (#90516); mount it when a draft exists even if posting is admin-only. */
function useShouldShowComposerForActiveEditDraft() {
    const shouldEditInComposer = useShouldEditInComposer();
    const {editingReportActionID} = useReportActionActiveEdit();
    return shouldEditInComposer && editingReportActionID !== null;
}

export default useShouldShowComposerForActiveEditDraft;
