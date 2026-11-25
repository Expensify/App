/**
 * Reads the targeted advertising consent decision from the Ketch consent cookie.
 * Returns undefined when the cookie, the targeted advertising purpose, or its status is missing or malformed.
 */
const KETCH_CONSENT_COOKIE_NAME = '_ketch_consent_v1_';
const TARGETED_ADVERTISING_PURPOSE = 'targeted_advertising';

type KetchPurpose = {
    status?: string;
};

type KetchConsentCookie = Record<string, KetchPurpose | undefined>;

function isKetchConsentCookie(value: unknown): value is KetchConsentCookie {
    return typeof value === 'object' && value !== null;
}

function parseKetchConsentCookie(cookieString: string): boolean | undefined {
    const cookie = cookieString.split('; ').find((entry) => entry.startsWith(`${KETCH_CONSENT_COOKIE_NAME}=`));
    if (!cookie) {
        return undefined;
    }

    try {
        const encodedValue = decodeURIComponent(cookie.slice(KETCH_CONSENT_COOKIE_NAME.length + 1));
        const parsed: unknown = JSON.parse(atob(encodedValue));
        if (!isKetchConsentCookie(parsed)) {
            return undefined;
        }

        const status = parsed[TARGETED_ADVERTISING_PURPOSE]?.status;
        if (status === 'granted') {
            return true;
        }

        if (status === 'denied') {
            return false;
        }

        return undefined;
    } catch {
        return undefined;
    }
}

export default parseKetchConsentCookie;
