import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AttachmentModalScreenParams} from './types';

type AttachmentModalContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    addAttachment(attachmentProps: Partial<AttachmentModalScreenParams>): string;
    removeAttachment(attachmentId: string): void;
    getAttachmentById(attachmentId: string): Partial<AttachmentModalScreenParams> | undefined;
};

const AttachmentModalContext = React.createContext<AttachmentModalContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    addAttachment: () => '',
    removeAttachment: () => undefined,
    getAttachmentById: () => undefined,
});

function AttachmentModalProvider({children}: ChildrenProps) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const attachments = useRef<Record<string, Partial<AttachmentModalScreenParams>>>({});
    const addAttachment = useCallback<AttachmentModalContextValue['addAttachment']>(
        (attachmentProps) => {
            const attachmentCount = Object.keys(attachments.current).length;
            const attachmentId = `attachment_${attachmentCount + 1}`;
            attachments.current = {...attachments.current, [attachmentId]: attachmentProps};
            return attachmentId;
        },
        [attachments],
    );

    const removeAttachment = useCallback<AttachmentModalContextValue['removeAttachment']>(
        (attachmentId) => {
            delete attachments.current[attachmentId];
        },
        [attachments],
    );

    const getAttachmentById = useCallback<AttachmentModalContextValue['getAttachmentById']>(
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

    return <AttachmentModalContext.Provider value={contextValue}>{children}</AttachmentModalContext.Provider>;
}

AttachmentModalProvider.displayName = 'AttachmentModalProvider';

export default AttachmentModalContext;
export {AttachmentModalProvider};
