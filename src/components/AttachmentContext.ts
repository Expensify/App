import {createContext} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AttachmentContextProps = {
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
    reportID?: string;
    accountID?: number;
    hashKey?: number;
};

const AttachmentContext = createContext<AttachmentContextProps>({
    type: undefined,
    reportID: undefined,
    accountID: undefined,
    hashKey: undefined,
});

export {
    // eslint-disable-next-line import/prefer-default-export
    AttachmentContext,
};
