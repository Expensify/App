import type {ValueOf} from 'type-fest';

const localeCodes = {
    en: 'en_US',
    es: 'es_ES',
} as const;

type LanguageCode = keyof typeof localeCodes;
type LocaleCode = ValueOf<typeof localeCodes>;

const GetUserLanguage = (): LocaleCode => {
    const userLanguage = navigator.language || navigator.userLanguage;
    const languageCode = userLanguage.split('-').at(0) as LanguageCode;
    return localeCodes[languageCode] || 'en_US';
};

GetUserLanguage.displayName = 'GetUserLanguage';

export default GetUserLanguage;
