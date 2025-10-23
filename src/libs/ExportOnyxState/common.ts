import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';
import type {MaskOnyxState} from './types';

const MASKING_PATTERN = '***';

type ExportRule = {
    allowList: string[];
    maskList: string[];
};

const ONYX_KEY_EXPORT_RULES: Record<string, ExportRule> = {
    [ONYXKEYS.SESSION]: {
        allowList: ['email', 'accountID', 'loading', 'creationDate', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.STASHED_SESSION]: {
        allowList: ['email', 'accountID', 'loading', 'creationDate', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.CREDENTIALS]: {
        allowList: ['login', 'accountID'],
        maskList: [],
    },
    [ONYXKEYS.STASHED_CREDENTIALS]: {
        allowList: ['login', 'accountID'],
        maskList: [],
    },
    [ONYXKEYS.ACCOUNT]: {
        allowList: ['validated', 'isFromPublicDomain', 'isUsingExpensifyCard'],
        maskList: ['primaryLogin'],
    },
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
        allowList: ['accountID', 'timezone', 'status', 'pronouns'],
        maskList: ['firstName', 'lastName', 'displayName', 'avatar', 'login'],
    },
    [ONYXKEYS.COLLECTION.REPORT]: {
        allowList: [
            'reportID',
            'type',
            'chatType',
            'lastActorAccountID',
            'participants',
            'pendingFields',
            'ownerAccountID',
            'stateNum',
            'statusNum',
            'isOwnPolicyExpenseChat',
            'participantAccountIDs',
            'total',
            'currency',
            'created',
        ],
        maskList: ['reportName', 'description', 'ownerAccountID', 'managerID'],
    },
    [ONYXKEYS.COLLECTION.TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'amount', 'currency', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.POLICY]: {
        allowList: ['id', 'type', 'role', 'outputCurrency', 'isPolicyExpenseChatEnabled', 'areCategoriesEnabled', 'areTagsEnabled'],
        maskList: ['name', 'avatar'],
    },
    [ONYXKEYS.USER_WALLET]: {
        allowList: ['currentBalance', 'availableBalance', 'tierName'],
        maskList: [],
    },
    [ONYXKEYS.BANK_ACCOUNT_LIST]: {
        allowList: ['accountType', 'currency'],
        maskList: ['accountNumber', 'routingNumber', 'addressName'],
    },
    [ONYXKEYS.CARD_LIST]: {
        allowList: ['accountID', 'bank', 'isVirtual', 'cardID'],
        maskList: ['lastFourPAN', 'nameOnCard'],
    },
};

const onyxKeysToRemove: Array<ValueOf<typeof ONYXKEYS>> = [
    ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    ONYXKEYS.PLAID_LINK_TOKEN,
    ONYXKEYS.ONFIDO_TOKEN,
    ONYXKEYS.ONFIDO_APPLICANT_ID,
];

const keysToMask = [
    'addressCity',
    'addressName',
    'addressStreet',
    'addressZipCode',
    'avatar',
    'avatarURL',
    'bank',
    'cardName',
    'cardNumber',
    'city',
    'comment',
    'description',
    'displayName',
    'edits',
    'firstName',
    'lastMessageHtml',
    'lastMessageText',
    'lastName',
    'legalFirstName',
    'legalLastName',
    'merchant',
    'modifiedMerchant',
    'name',
    'oldPolicyName',
    'owner',
    'phoneNumber',
    'plaidAccessToken',
    'plaidAccountID',
    'plaidLinkToken',
    'policyAvatar',
    'policyName',
    'primaryLogin',
    'reportName',
    'routingNumber',
    'source',
    'state',
    'street',
    'validateCode',
    'zip',
    'zipCode',
];

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const emailMap = new Map<string, string>();

const getRandomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

function getRandomString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += getRandomLetter();
    }
    return result;
}

function maskValuePreservingLength(value: unknown) {
    if (typeof value !== 'string') {
        return MASKING_PATTERN;
    }

    return getRandomString(value.length);
}

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

const processOnyxKeyWithRule = (key: string, data: unknown, rule: ExportRule): unknown => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item: unknown) => (typeof item === 'object' ? processOnyxKeyWithRule(key, item, rule) : item));
    }

    if (typeof data === 'object') {
        const processedData: Record<string, unknown> = {};

        Object.keys(data as Record<string, unknown>).forEach((fieldKey) => {
            const fieldValue = (data as Record<string, unknown>)[fieldKey];

            if (rule.maskList.includes(fieldKey)) {
                processedData[fieldKey] = maskValuePreservingLength(fieldValue);
            } else if (rule.allowList.includes(fieldKey)) {
                processedData[fieldKey] = fieldValue;
            } else {
                processedData[fieldKey] = MASKING_PATTERN;
            }
        });

        return processedData;
    }

    return data;
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
                maskedData[key] = maskValuePreservingLength(value);
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
    let onyxState = {...data};

    onyxState = removePrivateOnyxKeys(onyxState);

    Object.keys(onyxState).forEach((key) => {
        let ruleKey = key;
        const collectionKey = Object.values(ONYXKEYS.COLLECTION).find((cKey) => key.startsWith(cKey));
        if (collectionKey) {
            ruleKey = collectionKey;
        }

        const rule = ONYX_KEY_EXPORT_RULES[ruleKey];

        if (rule) {
            onyxState[key] = processOnyxKeyWithRule(key, onyxState[key], rule);
        }
    });

    if (isMaskingFragileDataEnabled) {
        onyxState = maskFragileData(onyxState) as OnyxState;
    }

    emailMap.clear();
    return onyxState;
};

export {maskOnyxState, emailRegex};
