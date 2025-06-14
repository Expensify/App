import CONST from '@src/CONST';
import type {Locale, SupportedLanguage} from '@src/CONST/LOCALES';
import {UPCOMING_LOCALES} from '@src/CONST/LOCALES';

function getLanguageFromLocale(locale: Locale): SupportedLanguage {
    switch (locale) {
        case CONST.LOCALES.ES_ES:
        case CONST.LOCALES.ES_ES_ONFIDO:
        case CONST.LOCALES.ES:
            return CONST.LOCALES.ES;
        case CONST.LOCALES.EN:
            return CONST.LOCALES.EN;
        case UPCOMING_LOCALES.FR:
            return UPCOMING_LOCALES.FR;
        case UPCOMING_LOCALES.DE:
            return UPCOMING_LOCALES.DE;
        case UPCOMING_LOCALES.IT:
            return UPCOMING_LOCALES.IT;
        case UPCOMING_LOCALES.PT_BR:
            return UPCOMING_LOCALES.PT_BR;
        case UPCOMING_LOCALES.NL:
            return UPCOMING_LOCALES.NL;
        case UPCOMING_LOCALES.JA:
            return UPCOMING_LOCALES.JA;
        case UPCOMING_LOCALES.ZH_HANS:
            return UPCOMING_LOCALES.ZH_HANS;
        default:
            return CONST.LOCALES.DEFAULT;
    }
}

export default {getLanguageFromLocale};
