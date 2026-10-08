import type {Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxEntry} from 'react-native-onyx';

type ReplyInThreadProviderProps = ChildrenProps & {
    /** The chat whose messages can be swiped */
    report: OnyxEntry<Report>;

    /** Whether the chat is archived */
    isReportArchived: boolean;
};

export default ReplyInThreadProviderProps;
