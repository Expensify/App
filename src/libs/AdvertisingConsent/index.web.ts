import parseKetchConsentCookie from './parseKetchConsentCookie';

function getAdvertisingConsentParams(): {isAdvertisingConsentGranted?: boolean} {
    const isAdvertisingConsentGranted = parseKetchConsentCookie(document.cookie);
    return isAdvertisingConsentGranted === undefined ? {} : {isAdvertisingConsentGranted};
}

export default getAdvertisingConsentParams;
