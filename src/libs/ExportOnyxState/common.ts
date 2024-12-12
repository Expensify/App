import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

const MASKING_PATTERN = '***';
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const emailMap = new Map<string, string>();

const getRandomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

function stringContainsEmail(text: string) {
    return emailRegex.test(text);
}

function extractEmail(text: string) {
    const match = text.match(emailRegex);
    return match ? match[0] : null; // Return the email if found, otherwise null
}

const randomizeEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    const [domainName, tld] = domain.split('.');

    const randomizePart = (part: string) => [...part].map((c) => (/[a-zA-Z0-9]/.test(c) ? getRandomLetter() : c)).join('');
    const randomLocal = randomizePart(localPart);
    const randomDomain = randomizePart(domainName);

    return `${randomLocal}@${randomDomain}.${tld}`;
};

function replaceEmailInString(text: string, emailReplacement: string) {
    return text.replace(emailRegex, emailReplacement);
}

const maskSessionDetails = (data: Record<string, unknown>): Record<string, unknown> => {
    const session = data.session as Session;
    const maskedData: Record<string, unknown> = {};

    Object.keys(session).forEach((key) => {
        if (key !== 'authToken' && key !== 'encryptedAuthToken') {
            maskedData[key] = session[key as keyof Session];
            return;
        }
        maskedData[key] = MASKING_PATTERN;
    });

    return {
        ...data,
        session: maskedData,
    };
};

const maskEmail = (email: string) => {
    let maskedEmail = '';
    if (!emailMap.has(email)) {
        maskedEmail = randomizeEmail(email);
        emailMap.set(email, maskedEmail);
    } else {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        maskedEmail = emailMap.get(email) as string;
    }
    return maskedEmail;
};

const maskFragileData = (data: Record<string, unknown> | unknown[] | null, parentKey?: string): Record<string, unknown> | unknown[] | null => {
    if (data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item): unknown => {
            if (typeof item === 'string' && Str.isValidEmail(item)) {
                return maskEmail(item);
            }
            return typeof item === 'object' ? maskFragileData(item as Record<string, unknown>, parentKey) : item;
        });
    }

    const maskedData: Record<string, unknown> = {};

    Object.keys(data).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            return;
        }

        // loginList is an object that contains emails as keys, the keys should be masked as well
        let propertyName = '';
        if (Str.isValidEmail(key)) {
            propertyName = maskEmail(key);
        } else {
            propertyName = key;
        }

        const value = data[propertyName];

        if (typeof value === 'string' && Str.isValidEmail(value)) {
            maskedData[propertyName] = maskEmail(value);
        } else if (typeof value === 'string' && stringContainsEmail(value)) {
            maskedData[propertyName] = replaceEmailInString(value, maskEmail(extractEmail(value) ?? ''));
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (propertyName === 'text' || propertyName === 'html')) {
            maskedData[propertyName] = MASKING_PATTERN;
        } else if (typeof value === 'object') {
            maskedData[propertyName] = maskFragileData(value as Record<string, unknown>, propertyName.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? propertyName : parentKey);
        } else {
            maskedData[propertyName] = value;
        }
    });

    return maskedData;
};

const maskOnyxState = (data: Record<string, unknown>, isMaskingFragileDataEnabled?: boolean) => {
    let onyxState = data;
    // Mask session details by default
    onyxState = maskSessionDetails(onyxState);
    // Mask fragile data other than session details if the user has enabled the option
    if (isMaskingFragileDataEnabled) {
        onyxState = maskFragileData(onyxState) as Record<string, unknown>;
    }

    emailMap.clear();
    return onyxState;
};

export {maskOnyxState, emailRegex};
