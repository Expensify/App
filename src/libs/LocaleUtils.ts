import type {TupleToUnion, ValueOf} from 'type-fest';
import CONST from '@src/CONST';

function getLanguageFromLocale(locale: ValueOf<typeof CONST.LOCALES>): TupleToUnion<typeof CONST.LANGUAGES> {
    switch (locale) {
        case CONST.LOCALES.ES_ES:
        case CONST.LOCALES.ES_ES_ONFIDO:
        case CONST.LOCALES.ES:
            return CONST.LOCALES.ES;
        case CONST.LOCALES.EN:
            return CONST.LOCALES.EN;
        case CONST.LOCALES.FR:
            return CONST.LOCALES.FR;
        case CONST.LOCALES.DE:
            return CONST.LOCALES.DE;
        case CONST.LOCALES.IT:
            return CONST.LOCALES.IT;
        case CONST.LOCALES.PT_BR:
            return CONST.LOCALES.PT_BR;
        case CONST.LOCALES.NL:
            return CONST.LOCALES.NL;
        case CONST.LOCALES.JA:
            return CONST.LOCALES.JA;
        case CONST.LOCALES.ZH_HANS:
            return CONST.LOCALES.ZH_HANS;
        default:
            return CONST.LOCALES.DEFAULT;
    }
}

export default {getLanguageFromLocale};
