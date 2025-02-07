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
        case CONST.LOCALES.PT:
            return CONST.LOCALES.PT;
        case CONST.LOCALES.IT:
            return CONST.LOCALES.IT;
        case CONST.LOCALES.DE:
            return CONST.LOCALES.DE;
        case CONST.LOCALES.FR:
            return CONST.LOCALES.FR;
        case CONST.LOCALES.NL:
            return CONST.LOCALES.NL;
        case CONST.LOCALES.PL:
            return CONST.LOCALES.PL;
        case CONST.LOCALES.RU:
            return CONST.LOCALES.RU;
        case CONST.LOCALES.TR:
            return CONST.LOCALES.TR;
        case CONST.LOCALES.KO:
            return CONST.LOCALES.KO;
        case CONST.LOCALES.CH:
            return CONST.LOCALES.CH;
        case CONST.LOCALES.JA:
            return CONST.LOCALES.JA;
        case CONST.LOCALES.RO:
            return CONST.LOCALES.RO;
        default:
            return CONST.LOCALES.DEFAULT;
    }
}

export default {getLanguageFromLocale};
