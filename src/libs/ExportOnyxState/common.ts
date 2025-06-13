import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type OnyxState from '@src/types/onyx/OnyxState';
import type {MaskOnyxState} from './types';

const MASKING_PATTERN = '***';
const keysToMask = [
    'plaidLinkToken',
    'plaidAccessToken',
    'plaidAccountID',
    'addressName',
    'addressCity',
    'addressStreet',
    'addressZipCode',
    'street',
    'city',
    'state',
    'zip',
    'edits',
    'lastMessageHtml',
    'lastMessageText',
];

const onyxKeysToRemove: Array<ValueOf<typeof ONYXKEYS>> = [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID];

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

const maskSessionDetails = (onyxState: OnyxState): OnyxState => {
    const session = onyxState.session as Session;
    const maskedData: OnyxState = {};

    Object.keys(session).forEach((key) => {
        if (key !== 'authToken' && key !== 'encryptedAuthToken') {
            maskedData[key] = session[key as keyof Session];
            return;
        }
        maskedData[key] = MASKING_PATTERN;
    });

    return {
        ...onyxState,
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

const maskFragileData = (data: OnyxState | unknown[] | null, parentKey?: string): OnyxState | unknown[] | null => {
    if (data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item): unknown => {
            if (typeof item === 'string' && Str.isValidEmail(item)) {
                return maskEmail(item);
            }
            return typeof item === 'object' ? maskFragileData(item as OnyxState, parentKey) : item;
        });
    }

    const maskedData: OnyxState = {};

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

        if (keysToMask.includes(key)) {
            if (Array.isArray(value)) {
                maskedData[key] = value.map(() => MASKING_PATTERN);
            } else {
                maskedData[key] = MASKING_PATTERN;
            }
        } else if (typeof value === 'string' && Str.isValidEmail(value)) {
            maskedData[propertyName] = maskEmail(value);
        } else if (typeof value === 'string' && stringContainsEmail(value)) {
            maskedData[propertyName] = replaceEmailInString(value, maskEmail(extractEmail(value) ?? ''));
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (propertyName === 'text' || propertyName === 'html')) {
            maskedData[key] = MASKING_PATTERN;
        } else if (typeof value === 'object') {
            maskedData[propertyName] = maskFragileData(value as OnyxState, propertyName.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? propertyName : parentKey);
        } else {
            maskedData[propertyName] = value;
        }
    });

    return maskedData;
};

const removePrivateOnyxKeys = (onyxState: OnyxState): OnyxState => {
    const newState: OnyxState = {};

    Object.keys(onyxState).forEach((key) => {
        if (onyxKeysToRemove.includes(key as ValueOf<typeof ONYXKEYS>)) {
            return;
        }
        newState[key] = onyxState[key];
    });

    return newState;
};

const maskOnyxState: MaskOnyxState = (data, isMaskingFragileDataEnabled) => {
    let onyxState = data;

    // Mask session details by default
    onyxState = maskSessionDetails(onyxState);

    // Remove private/sensitive Onyx keys
    onyxState = removePrivateOnyxKeys(onyxState);

    // Mask fragile data other than session details if the user has enabled the option
    if (isMaskingFragileDataEnabled) {
        onyxState = maskFragileData(onyxState) as OnyxState;
    }

    emailMap.clear();
    return onyxState;
};

export {maskOnyxState, emailRegex};
