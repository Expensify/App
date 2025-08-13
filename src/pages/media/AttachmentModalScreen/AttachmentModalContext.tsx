import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AttachmentModalScreenParams} from './types';

type AttachmentModalContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    setCurrentAttachment: <RouteParams extends AttachmentModalScreenParams>(attachmentParams: RouteParams | undefined) => void;
    getCurrentAttachment: <RouteParams extends AttachmentModalScreenParams>() => RouteParams | undefined;
};

const AttachmentModalContext = React.createContext<AttachmentModalContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    setCurrentAttachment: () => {},
    getCurrentAttachment: () => undefined,
});

function AttachmentModalContextProvider({children}: ChildrenProps) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID?.currentReportID]);

    const currentAttachment = useRef<AttachmentModalScreenParams | undefined>(undefined);
    const setCurrentAttachment = useCallback(<RouteParams extends AttachmentModalScreenParams>(attachmentProps: RouteParams | undefined) => {
        currentAttachment.current = attachmentProps;
    }, []);
    const getCurrentAttachment = useCallback(<RouteParams extends AttachmentModalScreenParams>() => currentAttachment.current as RouteParams | undefined, []);
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

AttachmentModalContextProvider.displayName = 'AttachmentModalContextProvider';

export default AttachmentModalContext;
export {AttachmentModalContextProvider};
