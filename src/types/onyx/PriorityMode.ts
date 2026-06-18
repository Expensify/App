import type CONST from '@src/CONST';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

/** Modes that define how the user's chats are displayed in his chat list  */
type PriorityMode = OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

export default PriorityMode;
