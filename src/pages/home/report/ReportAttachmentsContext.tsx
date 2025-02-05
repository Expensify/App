import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type AttachmentModalProps = {
    source: AvatarSource;
    fallbackSource?: AvatarSource;
    headerTitle?: string;
    maybeIcon?: boolean;
    reportID?: string | undefined;
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
    accountID?: number | string;
    isAuthTokenRequired?: boolean;
    fileName?: string;
    attachmentLink?: string;
};

type ReportAttachmentsContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    addAttachment(attachmentProps: AttachmentModalProps): string;
    removeAttachment(attachmentId: string): void;
    getAttachmentById(attachmentId: string): AttachmentModalProps | undefined;
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

    const attachments = useRef<Record<string, AttachmentModalProps>>({});
    const addAttachment = useCallback(
        (attachmentProps: AttachmentModalProps) => {
            const attachmentId = `attachment_${attachmentProps.fileName ?? (attachmentProps.source as string)}`;
            attachments.current = {...attachments.current, [attachmentId]: attachmentProps};
            return attachmentId;
        },
        [attachments],
    );

    const removeAttachment = useCallback(
        (attachmentId: string) => {
            delete attachments.current[attachmentId];
        },
        [attachments],
    );

    const getAttachmentById = useCallback(
        (attachmentId: string) => {
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
export type {AttachmentModalProps};
