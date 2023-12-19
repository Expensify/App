import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Locale = ValueOf<typeof CONST.LOCALES>;

export default Locale;
