import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type BaseLocale = ValueOf<typeof CONST.LOCALES>;

type LocaleEventCallback = (locale?: BaseLocale) => void;

export type {LocaleEventCallback};
export default BaseLocale;
