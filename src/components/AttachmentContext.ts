import {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AttachmentContextProps = {
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
    reportID?: string;
    reportActionID?: string;
    accountID?: number;
};

const AttachmentContext = createContext<AttachmentContextProps>({
    type: undefined,
    reportID: undefined,
    reportActionID: undefined,
    accountID: undefined,
});

AttachmentContext.displayName = 'AttachmentContext';

function useAttachmentContext() {
    const attachmentContext = useContext(AttachmentContext);
    if (!attachmentContext) {
        throw new Error('useAttachmentContext must be used within a AttachmentContext.Provider');
    }
    return attachmentContext;
}

export {AttachmentContext, useAttachmentContext};
