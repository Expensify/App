import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PriorityMode = OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>;

export default PriorityMode;
