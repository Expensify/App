import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {createContext} from 'react';

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
