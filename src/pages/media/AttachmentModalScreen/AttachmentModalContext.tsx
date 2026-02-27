import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type AttachmentModalScreenParams from './routes/types';
import type {AttachmentModalScreenBaseParams, AttachmentModalScreenType} from './types';

type AttachmentModalContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, isHidden: boolean) => void;
    setCurrentAttachment: <Route extends AttachmentModalScreenType, RouteParams extends AttachmentModalScreenParams<Route> = AttachmentModalScreenParams<Route>>(
        attachmentParams: RouteParams | undefined,
    ) => void;
    getCurrentAttachment: <Route extends AttachmentModalScreenType, RouteParams extends AttachmentModalScreenParams<Route> = AttachmentModalScreenParams<Route>>() => RouteParams | undefined;
};

const AttachmentModalContext = React.createContext<AttachmentModalContextValue>({
    isAttachmentHidden: () => false,
    updateHiddenAttachments: () => {},
    setCurrentAttachment: () => {},
    getCurrentAttachment: () => undefined,
});

function AttachmentModalContextProvider({children}: ChildrenProps) {
    const {currentReportID} = useCurrentReportIDState();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const currentAttachment = useRef<AttachmentModalScreenBaseParams | undefined>(undefined);
    const setCurrentAttachment = useCallback(
        <Route extends AttachmentModalScreenType, RouteParams extends AttachmentModalScreenParams<Route> = AttachmentModalScreenParams<Route>>(attachmentProps: RouteParams | undefined) => {
            currentAttachment.current = attachmentProps;
        },
        [],
    );
    const getCurrentAttachment = useCallback(
        <Route extends AttachmentModalScreenType, RouteParams extends AttachmentModalScreenParams<Route> = AttachmentModalScreenParams<Route>>() =>
            currentAttachment.current as RouteParams | undefined,
        [],
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
            setCurrentAttachment,
            getCurrentAttachment,
        }),
        [setCurrentAttachment, getCurrentAttachment],
    );

    return <AttachmentModalContext.Provider value={contextValue}>{children}</AttachmentModalContext.Provider>;
}

export default AttachmentModalContext;
export {AttachmentModalContextProvider};
