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
            'created',
        ],
        maskList: ['reportName', 'description', 'ownerAccountID', 'managerID'],
    },
    [ONYXKEYS.COLLECTION.TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
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

const onyxKeysToRemove = new Set<ValueOf<typeof ONYXKEYS>>([
    ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    ONYXKEYS.PLAID_LINK_TOKEN,
    ONYXKEYS.ONFIDO_TOKEN,
    ONYXKEYS.ONFIDO_APPLICANT_ID,
]);

const keysToMask = new Set([
    'addressCity',
    'addressName',
    'addressStreet',
    'addressZipCode',
    'avatar',
    'avatarURL',
    'bank',
    'cardName',
    'cardNumber',
    'childReportName',
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
    'title',
    'validateCode',
    'zip',
    'zipCode',
]);

const amountKeysToRandomize = new Set(['amount', 'modifiedAmount', 'originalAmount', 'total', 'unheldTotal', 'unheldNonReimbursableTotal', 'nonReimbursableTotal']);

const nodesToFullyMask = new Set(['reservationList']);

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

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

function randomizeAmount(amount: number): number {
    if (!Number.isFinite(amount)) {
        return 0;
    }
    const randomizedValue = Math.floor(Math.random() * 999999) + 1;
    return amount < 0 ? -randomizedValue : randomizedValue;
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

const isDateValue = (value: unknown): boolean => {
    if (typeof value !== 'string') {
        return false;
    }

    const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // ISO date
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
    ];
    return datePatterns.some((pattern) => pattern.test(value));
};

const getCurrentDate = (): string => {
    return new Date().toISOString();
};

const processOnyxKeyWithRule = (key: string, data: unknown, rule: ExportRule): unknown => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item: unknown) => (typeof item === 'object' ? processOnyxKeyWithRule(key, item, rule) : item));
    }

    if (typeof data === 'object') {
        const processedData: Record<string, unknown> = {};

        for (const fieldKey of Object.keys(data as Record<string, unknown>)) {
            const fieldValue = (data as Record<string, unknown>)[fieldKey];

            if (rule.maskList.includes(fieldKey)) {
                processedData[fieldKey] = maskValuePreservingLength(fieldValue);
            } else if (rule.allowList.includes(fieldKey)) {
                processedData[fieldKey] = fieldValue;
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                // If it's an object and not in allowList/maskList, recursively process it
                processedData[fieldKey] = processOnyxKeyWithRule(key, fieldValue, rule);
            } else if (typeof fieldValue === 'number') {
                processedData[fieldKey] = randomizeAmount(fieldValue);
            } else if (typeof fieldValue === 'string' && isDateValue(fieldValue)) {
                processedData[fieldKey] = getCurrentDate();
            } else if (typeof fieldValue === 'string') {
                processedData[fieldKey] = maskValuePreservingLength(fieldValue);
            } else {
                // Default: redact to '***' for anything else
                processedData[fieldKey] = MASKING_PATTERN;
            }
        }

        return processedData;
    }

    return data;
};

const maskEmail = (email: string, emailMap: Map<string, string>) => {
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

const maskFragileData = (data: OnyxState | unknown[] | null, emailMap: Map<string, string>, parentKey?: string): OnyxState | unknown[] | null => {
    if (data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item): unknown => {
            if (typeof item === 'string' && Str.isValidEmail(item)) {
                return maskEmail(item, emailMap);
            }
            return typeof item === 'object' ? maskFragileData(item as OnyxState, emailMap, parentKey) : item;
        });
    }

    const maskedData: OnyxState = {};

    for (const sourceKey of Object.keys(data)) {
        if (!Object.prototype.hasOwnProperty.call(data, sourceKey)) {
            continue;
        }

        // Read value from source using the original key
        const value = (data as Record<string, unknown>)[sourceKey];

        // Determine the destination key - mask it if it's an email
        // (e.g., in loginList where email addresses are used as object keys)
        const destinationKey = Str.isValidEmail(sourceKey) ? maskEmail(sourceKey, emailMap) : sourceKey;

        // Skip values that are already masked as MASKING_PATTERN
        if (value === MASKING_PATTERN) {
            maskedData[destinationKey] = value;
            continue;
        }

        // Handle collection nodes (reportActions, reports, transactions)
        if (sourceKey.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (sourceKey.startsWith(ONYXKEYS.COLLECTION.REPORT) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (sourceKey.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (amountKeysToRandomize.has(sourceKey) && typeof value === 'number') {
            maskedData[destinationKey] = randomizeAmount(value);
            // Handle expensify_text_title masking
        } else if (parentKey === 'expensify_text_title' && sourceKey === 'value' && typeof value === 'string') {
            maskedData[destinationKey] = maskValuePreservingLength(value);
        } else if (sourceKey === 'expensify_text_title' && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, 'expensify_text_title');
            // Handle nodes that need full masking
        } else if (nodesToFullyMask.has(sourceKey) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'string' && isDateValue(value)) {
            maskedData[destinationKey] = getCurrentDate();
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'string') {
            maskedData[destinationKey] = maskValuePreservingLength(value);
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, parentKey);
        } else if (keysToMask.has(sourceKey)) {
            if (Array.isArray(value)) {
                maskedData[destinationKey] = value.map(() => MASKING_PATTERN);
            } else if (typeof value === 'object') {
                // If the value is an object, don't mask it as a string - recursively process it
                maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
            } else {
                maskedData[destinationKey] = maskValuePreservingLength(value);
            }
        } else if (typeof value === 'string' && Str.isValidEmail(value)) {
            maskedData[destinationKey] = maskEmail(value, emailMap);
        } else if (typeof value === 'string' && stringContainsEmail(value)) {
            maskedData[destinationKey] = replaceEmailInString(value, maskEmail(extractEmail(value) ?? '', emailMap));
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (destinationKey === 'text' || destinationKey === 'html')) {
            maskedData[destinationKey] = MASKING_PATTERN;
        } else if (typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, destinationKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? destinationKey : parentKey);
        } else {
            maskedData[destinationKey] = value;
        }
    }

    return maskedData;
};

const removePrivateOnyxKeys = (onyxState: OnyxState): OnyxState => {
    const newState: OnyxState = {};

    for (const key of Object.keys(onyxState)) {
        if (onyxKeysToRemove.has(key as ValueOf<typeof ONYXKEYS>)) {
            continue;
        }
        newState[key] = onyxState[key];
    }

    return newState;
};

const maskOnyxState: MaskOnyxState = (data, isMaskingFragileDataEnabled) => {
    const emailMap = new Map<string, string>();

    try {
        let onyxState = {...data};

        onyxState = removePrivateOnyxKeys(onyxState);

        const keysWithRules = new Set<string>();

        for (const key of Object.keys(onyxState)) {
            let ruleKey = key;
            const collectionKey = Object.values(ONYXKEYS.COLLECTION).find((cKey) => key.startsWith(cKey));
            if (collectionKey) {
                ruleKey = collectionKey;
            }

            const rule = ONYX_KEY_EXPORT_RULES[ruleKey];

            if (rule) {
                onyxState[key] = processOnyxKeyWithRule(key, onyxState[key], rule);
                keysWithRules.add(key);
            }
        }

        if (isMaskingFragileDataEnabled) {
            // Only apply maskFragileData to keys that don't have export rules
            const maskedState: OnyxState = {};
            for (const key of Object.keys(onyxState)) {
                if (keysWithRules.has(key)) {
                    maskedState[key] = onyxState[key];
                } else {
                    const masked = maskFragileData({[key]: onyxState[key]}, emailMap) as OnyxState;
                    maskedState[key] = masked[key];
                }
            }
            onyxState = maskedState;
        }

        return onyxState;
    } finally {
        // Always clear the email map, even if an error occurred
        emailMap.clear();
    }
};

export {maskOnyxState, emailRegex};
