import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type {AttachmentModalScreenParams} from '@pages/media/AttachmentModalScreen/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ReportAttachmentsContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    addAttachment(attachmentProps: Partial<AttachmentModalScreenParams>): string;
    removeAttachment(attachmentId: string): void;
    getAttachmentById(attachmentId: string): Partial<AttachmentModalScreenParams> | undefined;
};

const ReportAttachmentsContext = React.createContext<ReportAttachmentsContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    addAttachment: () => '',
    removeAttachment: () => undefined,
    getAttachmentById: () => undefined,
});

function ReportAttachmentsProvider({children}: ChildrenProps) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const attachments = useRef<Record<string, Partial<AttachmentModalScreenParams>>>({});
    const addAttachment = useCallback<ReportAttachmentsContextValue['addAttachment']>(
        (attachmentProps) => {
            const attachmentCount = Object.keys(attachments.current).length;
            const attachmentId = `attachment_${attachmentCount + 1}`;
            attachments.current = {...attachments.current, [attachmentId]: attachmentProps};
            return attachmentId;
        },
        [attachments],
    );

    const removeAttachment = useCallback<ReportAttachmentsContextValue['removeAttachment']>(
        (attachmentId) => {
            delete attachments.current[attachmentId];
        },
        [attachments],
    );

    const getAttachmentById = useCallback<ReportAttachmentsContextValue['getAttachmentById']>(
        (attachmentId) => {
            return attachments.current[attachmentId];
        },
        [attachments],
    );

    const contextValue = useMemo(
        () => ({
            isAttachmentHidden: (reportActionID: string) => hiddenAttachments.current[reportActionID],
            updateHiddenAttachments: (reportActionID: string, value: boolean) => {
                hiddenAttachments.current = {
                    ...hiddenAttachments.current,
                    [reportActionID]: value,
                };
            },
            addAttachment,
            removeAttachment,
            getAttachmentById,
        }),
        [addAttachment, getAttachmentById, removeAttachment],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
