import type {Message} from './ReportAction';

/** An edit saved while its attachment was still uploading, replayed once the attachment has synced */
type DeferredAttachmentEdit = {
    /** Report the edited comment belongs to */
    reportID: string;

    /** Markdown the user saved, still holding the local attachment reference */
    textForNewComment: string;

    /** Login of the editor, needed to parse mentions on replay */
    currentUserLogin: string;

    /** Whether the report was archived when the edit was saved */
    isOriginalReportArchived?: boolean;

    /** Message shown before the edit, restored if the upload fails */
    originalMessage?: Message;

    /** Video attributes the editor cached for the draft, keyed by source */
    videoAttributeCache?: Record<string, string>;
};

/** Deferred attachment edits, indexed by report action ID */
type DeferredAttachmentEdits = Record<string, DeferredAttachmentEdit>;

export default DeferredAttachmentEdits;
export type {DeferredAttachmentEdit};
