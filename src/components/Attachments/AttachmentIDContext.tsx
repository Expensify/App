import React, {createContext, useMemo} from 'react';

type AttachmentIDContextValue = {
    attachmentID?: string;
};

const AttachmentIDContext = createContext<AttachmentIDContextValue>({
    attachmentID: undefined,
});

function AttachmentIDContextProvider({attachmentID, children}: AttachmentIDContextValue & {children: React.ReactNode}) {
    const value = useMemo(() => ({attachmentID}), [attachmentID]);
    return <AttachmentIDContext.Provider value={value}>{children}</AttachmentIDContext.Provider>;
}

export {AttachmentIDContext, AttachmentIDContextProvider};
