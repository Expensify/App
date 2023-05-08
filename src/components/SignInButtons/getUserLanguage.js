const localeCodes = {
    en: 'en_US',
    es: 'es_ES',
};

const getUserLanguage = () => {
    const userLanguage = navigator.language || navigator.userLanguage;
    const languageCode = userLanguage.split('-')[0];
    return localeCodes[languageCode] || 'en_US';
};

getUserLanguage.displayName = 'getUserLanguage';

export default getUserLanguage;
