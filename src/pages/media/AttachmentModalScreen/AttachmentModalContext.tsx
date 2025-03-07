import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type AttachmentModalRouteProps from './routes/types';

type AttachmentContextProps = Omit<Partial<AttachmentModalRouteProps>, 'navigation'>;

type AttachmentModalContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    setCurrentAttachment: (attachmentProps: AttachmentContextProps | undefined) => void;
    getCurrentAttachment: () => AttachmentContextProps | undefined;
};

const AttachmentModalContext = React.createContext<AttachmentModalContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    setCurrentAttachment: () => {},
    getCurrentAttachment: () => undefined,
});

function AttachmentModalProvider({children}: ChildrenProps) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const currentAttachment = useRef<AttachmentContextProps | undefined>(undefined);
    const setCurrentAttachment = useCallback((attachmentProps: AttachmentContextProps | undefined) => {
        currentAttachment.current = attachmentProps;
    }, []);
    const getCurrentAttachment = useCallback(() => currentAttachment.current, []);
    const contextValue = useMemo(
        () => ({
            isAttachmentHidden: (reportActionID: string) => hiddenAttachments.current[reportActionID],
            updateHiddenAttachments: (reportActionID: string, value: boolean) => {
                hiddenAttachments.current = {
                    ...hiddenAttachments.current,
                    [reportActionID]: value,
                };
            },
            setCurrentAttachment,
            getCurrentAttachment,
        }),
        [setCurrentAttachment, getCurrentAttachment],
    );

    return <AttachmentModalContext.Provider value={contextValue}>{children}</AttachmentModalContext.Provider>;
}

AttachmentModalProvider.displayName = 'AttachmentModalProvider';

export default AttachmentModalContext;
export {AttachmentModalProvider};
export type {AttachmentContextProps};
