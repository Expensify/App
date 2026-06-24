import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useReportActionActiveEdit} from './ReportActionEditMessageContext';

/** Narrow-screen edits use the bottom composer (#90516); mount it when a draft exists even if posting is admin-only. */
function useShouldShowComposerForActiveEditDraft() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {editingReportActionID} = useReportActionActiveEdit();
    return shouldUseNarrowLayout && editingReportActionID !== null;
}

export default useShouldShowComposerForActiveEditDraft;
