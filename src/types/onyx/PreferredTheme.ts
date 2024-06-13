import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Possible user preferred themes to be used in the whole app */
type PreferredTheme = OnyxEntry<ValueOf<typeof CONST.THEME>>;

export default PreferredTheme;
