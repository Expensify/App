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
    accountID?: number;
    isAuthTokenRequired?: boolean;
    fileName?: string;
    attachmentLink?: string;
};

type ReportAttachmentsContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    addAttachment(attachmentProps: AttachmentModalProps): string;
    getAttachmentById(id: string): AttachmentModalProps | undefined;
};

const ReportAttachmentsContext = React.createContext<ReportAttachmentsContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    addAttachment: () => '',
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
            const attachmentId = `attachment_props_${attachmentProps.fileName ?? attachmentProps.source}`;
            attachments.current = {...attachments.current, [attachmentId]: attachmentProps};
            return attachmentId;
        },
        [attachments],
    );

    const getAttachmentById = useCallback(
        (attachmentId: string) => {
            const attachmentProps = attachments.current[attachmentId];
            delete attachments.current[attachmentId];
            return attachmentProps;
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
            getAttachmentById,
        }),
        [addAttachment, getAttachmentById],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
export type {AttachmentModalProps};
