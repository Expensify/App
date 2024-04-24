import {createContext} from 'react';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type AttachmentContextProps = {
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
    id?: string;
};

const AttachmentContext = createContext<AttachmentContextProps>({
    type: undefined,
    id: undefined,
});

AttachmentContext.displayName = 'AttachmentContext';

export {AttachmentContext};
