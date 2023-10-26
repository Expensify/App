import {ValueOf} from 'type-fest';
import CONST from '../../../CONST';

type BaseLocale = ValueOf<typeof CONST.LOCALES>;

type LocaleListenerConnect = (callbackAfterChange?: (locale?: BaseLocale) => void) => void;

export type {LocaleListenerConnect};
export default BaseLocale;
