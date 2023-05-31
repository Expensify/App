const localeCodes = {
    en: 'en_US',
    es: 'es_ES',
};

const GetUserLanguage = () => {
    const userLanguage = navigator.language || navigator.userLanguage;
    const languageCode = userLanguage.split('-')[0];
    return localeCodes[languageCode] || 'en_US';
};

GetUserLanguage.displayName = 'GetUserLanguage';

export default GetUserLanguage;
