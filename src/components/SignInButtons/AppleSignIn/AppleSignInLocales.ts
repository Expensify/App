/* eslint-disable @typescript-eslint/naming-convention */
import type {ValueOf} from 'type-fest';
import {LOCALES} from '@src/CONST/LOCALES';
import type Locale from '@src/types/onyx/Locale';

/**
 * The set of locales supported by Apple Sign In.
 * Reference: https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms
 */
const APPLE_SIGN_IN_LOCALES = {
    ar_SA: 'ar_SA',
    ca_ES: 'ca_ES',
    cs_CZ: 'cs_CZ',
    da_DK: 'da_DK',
    de_DE: 'de_DE',
    el_GR: 'el_GR',
    en_GB: 'en_GB',
    en_US: 'en_US',
    es_ES: 'es_ES',
    es_MX: 'es_MX',
    fi_FI: 'fi_FI',
    fr_CA: 'fr_CA',
    fr_FR: 'fr_FR',
    hr_HR: 'hr_HR',
    hu_HU: 'hu_HU',
    id_ID: 'id_ID',
    it_IT: 'it_IT',
    iw_IL: 'iw_IL',
    ja_JP: 'ja_JP',
    ko_KR: 'ko_KR',
    ms_MY: 'ms_MY',
    nl_NL: 'nl_NL',
    no_NO: 'no_NO',
    pl_PL: 'pl_PL',
    pt_BR: 'pt_BR',
    pt_PT: 'pt_PT',
    ro_RO: 'ro_RO',
    ru_RU: 'ru_RU',
    sk_SK: 'sk_SK',
    sv_SE: 'sv_SE',
    th_TH: 'th_TH',
    tr_TR: 'tr_TR',
    uk_UA: 'uk_UA',
    vi_VI: 'vi_VI',
    zh_CN: 'zh_CN',
    zh_HK: 'zh_HK',
    zh_TW: 'zh_TW',
} as const;

const MAP_EXFY_LOCALE_TO_APPLE_LOCALE: Record<Locale, ValueOf<typeof APPLE_SIGN_IN_LOCALES>> = {
    [LOCALES.DE]: APPLE_SIGN_IN_LOCALES.de_DE,
    [LOCALES.EN]: APPLE_SIGN_IN_LOCALES.en_US,
    [LOCALES.ES]: APPLE_SIGN_IN_LOCALES.es_ES,
    [LOCALES.FR]: APPLE_SIGN_IN_LOCALES.fr_FR,
    [LOCALES.IT]: APPLE_SIGN_IN_LOCALES.it_IT,
    [LOCALES.JA]: APPLE_SIGN_IN_LOCALES.ja_JP,
    [LOCALES.NL]: APPLE_SIGN_IN_LOCALES.nl_NL,
    [LOCALES.PL]: APPLE_SIGN_IN_LOCALES.pl_PL,
    [LOCALES.PT_BR]: APPLE_SIGN_IN_LOCALES.pt_BR,
    [LOCALES.ZH_HANS]: APPLE_SIGN_IN_LOCALES.zh_CN,
};

export default MAP_EXFY_LOCALE_TO_APPLE_LOCALE;
