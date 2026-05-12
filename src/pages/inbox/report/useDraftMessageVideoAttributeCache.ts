import type React from 'react';
import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import Parser from '@libs/Parser';
import {getReportActionHtml, isDeletedAction} from '@libs/ReportActionsUtils';
import type * as OnyxTypes from '@src/types/onyx';

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

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        draftMessageVideoAttributeCache.clear();

        const originalMessage = Parser.htmlToMarkdown(getReportActionHtml(editingReportAction), {
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
    }, [draftMessage, editingReportAction, isEditInProgressRef, isEditing, prevDraftMessage, updateDraftMessageProp]);

    return draftMessageVideoAttributeCache;
}

export default useDraftMessageVideoAttributeCache;
export {draftMessageVideoAttributeCache};
export type {DraftMessageVideoAttributeCache};
