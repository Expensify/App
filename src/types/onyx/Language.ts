import type {Spread, TupleToUnion} from 'type-fest';
import type {LANGUAGES, UPCOMING_LANGUAGES} from '@src/CONST/LOCALES';

/**
 * Supported (or soon-to-be supported) languages in the app.
 */
type Language = TupleToUnion<Spread<typeof LANGUAGES, typeof UPCOMING_LANGUAGES>>;

export default Language;
