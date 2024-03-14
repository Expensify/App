import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PreferredTheme = OnyxEntry<ValueOf<typeof CONST.THEME>>;

export default PreferredTheme;
