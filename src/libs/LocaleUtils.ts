import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

function getLanguageFromLocale(locale: ValueOf<typeof CONST.LOCALES>): (typeof CONST.LANGUAGES)[number] {
    switch (locale) {
        case CONST.LOCALES.ES_ES:
        case CONST.LOCALES.ES_ES_ONFIDO:
        case CONST.LOCALES.ES:
            return CONST.LOCALES.ES;
        case CONST.LOCALES.EN:
            return CONST.LOCALES.EN;
        default:
            return CONST.LOCALES.DEFAULT;
    }
}

export default {getLanguageFromLocale};
