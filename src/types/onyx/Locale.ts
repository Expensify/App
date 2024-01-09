import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type Locale = ValueOf<typeof CONST.LOCALES>;

export default Locale;
