import {ValueOf} from 'type-fest';
import CONST from '../../../CONST';

type BaseLocale = ValueOf<typeof CONST.LOCALES>;

export default BaseLocale;
