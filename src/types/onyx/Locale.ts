import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Available locale values */
type Locale = ValueOf<typeof CONST.LOCALES>;

export default Locale;
