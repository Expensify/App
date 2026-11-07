import {useMentionedAccountIDToNameMap} from '@hooks/useAccountIDToNameMap';
import usePrevious from '@hooks/usePrevious';
import {useMentionedReportIDToNameMap} from '@hooks/useReportIDToNameMap';

import Parser from '@libs/Parser';
import {getReportActionHtml, isDeletedAction} from '@libs/ReportActionsUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type React from 'react';

import {useEffect} from 'react';

type DraftMessageVideoAttributeCache = Map<string, string>;

const draftMessageVideoAttributeCache: DraftMessageVideoAttributeCache = new Map();
type UseDraftMessageVideoAttributeCacheProps = {
    draftMessage: string;
    isEditing: boolean;
    editingReportAction: OnyxTypes.ReportAction | null;
    updateDraftMessage: (draftMessage: string) => void;
    isEditInProgressRef: React.RefObject<boolean>;
};

function useDraftMessageVideoAttributeCache({
    draftMessage,
    isEditing = false,
    editingReportAction = null,
    updateDraftMessage: updateDraftMessageProp = () => {},
    isEditInProgressRef,
}: UseDraftMessageVideoAttributeCacheProps): DraftMessageVideoAttributeCache {
    const prevDraftMessage = usePrevious(draftMessage);
    // Only the names the edited message mentions are needed, and only while editing, so the subscriptions stay scoped to them
    const editingReportActionHtml = isEditing ? getReportActionHtml(editingReportAction) : undefined;
    const accountIDToName = useMentionedAccountIDToNameMap(editingReportActionHtml);
    const reportIDToName = useMentionedReportIDToNameMap(editingReportActionHtml);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        draftMessageVideoAttributeCache.clear();

        const originalMessage = Parser.htmlToMarkdown(getReportActionHtml(editingReportAction), {
            reportIDToName,
            accountIDToName,
            cacheVideoAttributes: (videoSource, attrs) => draftMessageVideoAttributeCache.set(videoSource, attrs),
        });
        if (
            isDeletedAction(editingReportAction) ||
            !!(editingReportAction?.message && draftMessage === originalMessage) ||
            !!(prevDraftMessage === draftMessage || isEditInProgressRef.current)
        ) {
            return;
        }
        updateDraftMessageProp(draftMessage);
    }, [draftMessage, editingReportAction, isEditInProgressRef, isEditing, prevDraftMessage, accountIDToName, reportIDToName, updateDraftMessageProp]);

    return draftMessageVideoAttributeCache;
}

export default useDraftMessageVideoAttributeCache;
export {draftMessageVideoAttributeCache};
