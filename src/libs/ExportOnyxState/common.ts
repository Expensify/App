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
    ONYXKEYS.TRAVEL_PROVISIONING,
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
    'reservationList',
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

/**
 * Helper function to remove collection items based on extracted ID matching a set
 */
const removeCollectionItemsByID = (
    onyxState: OnyxState,
    collectionPrefix: string,
    excludedIDs: Set<string>,
    idExtractor: (key: string) => string = (key) => key.replace(collectionPrefix, ''),
): void => {
    Object.keys(onyxState).forEach((key) => {
        if (key.startsWith(collectionPrefix)) {
            const id = idExtractor(key);
            if (excludedIDs.has(id)) {
                delete onyxState[key];
            }
        }
    });
};

/**
 * Helper function to remove collection items with nested objects that have reportID or policyID
 */
const removeCollectionItemsByNestedID = (onyxState: OnyxState, collectionPrefix: string, excludedIDs: Set<string>, idField: 'reportID' | 'policyID'): void => {
    Object.keys(onyxState).forEach((key) => {
        if (key.startsWith(collectionPrefix)) {
            const item = onyxState[key] as Record<string, unknown>;
            if (item && typeof item[idField] === 'string' && excludedIDs.has(item[idField])) {
                delete onyxState[key];
            }
        }
    });
};

const maskOnyxState: MaskOnyxState = (data, isMaskingFragileDataEnabled) => {
    let onyxState = {...data};

    // Identify policies owned by accounting@expensify.com or payroll@expensify.com (only when masking is enabled)
    // Do this before any processing to ensure policy owners haven't been masked yet
    const excludedEmails = ['accounting@expensify.com', 'payroll@expensify.com'];
    const excludedPolicyIDs = new Set<string>();

    if (isMaskingFragileDataEnabled) {
        Object.keys(data).forEach((key) => {
            if (key.startsWith(ONYXKEYS.COLLECTION.POLICY)) {
                const policy = data[key] as Record<string, unknown>;
                const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY, '');

                if (policy && typeof policy.owner === 'string' && excludedEmails.includes(policy.owner.toLowerCase())) {
                    excludedPolicyIDs.add(policyID);
                }
            }
        });
    }

    onyxState = removePrivateOnyxKeys(onyxState);

    // Remove search snapshots when masking is enabled - they contain duplicate transaction/report data
    if (isMaskingFragileDataEnabled) {
        Object.keys(onyxState).forEach((key) => {
            if (key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)) {
                delete onyxState[key];
            }
        });
    }

    // Identify reports that belong to excluded policies, or are paycheck reports (when masking enabled)
    const excludedReportIDs = new Set<string>();
    Object.keys(onyxState).forEach((key) => {
        if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
            const report = onyxState[key] as Record<string, unknown>;
            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT, '');

            if (report && typeof report.policyID === 'string' && excludedPolicyIDs.has(report.policyID)) {
                excludedReportIDs.add(reportID);
                delete onyxState[key];
            }
            // If masking is enabled, also remove paycheck reports
            else if (isMaskingFragileDataEnabled && report && report.type === 'paycheck') {
                excludedReportIDs.add(reportID);
                delete onyxState[key];
            }
        }
    });

    // Track orphaned reports (those that don't exist in COLLECTION.REPORT) - will be populated when filtering derived keys
    const orphanedReportIDs = new Set<string>();

    // Remove transactions that belong to excluded reports
    const excludedTransactionIDs = new Set<string>();
    Object.keys(onyxState).forEach((key) => {
        if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const transaction = onyxState[key] as Record<string, unknown>;
            const transactionID = key.replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

            if (transaction && typeof transaction.reportID === 'string') {
                // Remove if the report is in the excluded list
                if (excludedReportIDs.has(transaction.reportID)) {
                    excludedTransactionIDs.add(transactionID);
                    delete onyxState[key];
                }
                // Also check if the report exists and belongs to an excluded policy or is a paycheck
                else {
                    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`;
                    const txReport = data[reportKey] as Record<string, unknown> | undefined;

                    // Remove if report belongs to excluded policy or is paycheck (when masking enabled)
                    if (txReport && typeof txReport.policyID === 'string' && excludedPolicyIDs.has(txReport.policyID)) {
                        excludedTransactionIDs.add(transactionID);
                        delete onyxState[key];
                    } else if (isMaskingFragileDataEnabled && txReport && txReport.type === 'paycheck') {
                        excludedTransactionIDs.add(transactionID);
                        delete onyxState[key];
                    }
                }
            }
        }
    });

    // Remove related data for excluded reports and transactions
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.REPORT_ACTIONS, excludedReportIDs);
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS, excludedReportIDs);
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.REPORT_VIOLATIONS, excludedReportIDs);
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.REPORT_METADATA, excludedReportIDs);
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, excludedReportIDs);
    removeCollectionItemsByID(onyxState, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, excludedTransactionIDs);

    removeCollectionItemsByNestedID(onyxState, ONYXKEYS.COLLECTION.REPORT_DRAFT, excludedPolicyIDs, 'policyID');
    removeCollectionItemsByNestedID(onyxState, ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, excludedReportIDs, 'reportID');
    removeCollectionItemsByNestedID(onyxState, ONYXKEYS.COLLECTION.TRANSACTION_BACKUP, excludedReportIDs, 'reportID');

    // Filter derived keys to remove data for excluded reports
    if (onyxState[ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS] && typeof onyxState[ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS] === 'object') {
        const reportTransactions = onyxState[ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS] as Record<string, unknown>;

        // We need to check ALL reports - some reports only exist here and not in COLLECTION.REPORT
        Object.keys(reportTransactions).forEach((reportID) => {
            const reportData = reportTransactions[reportID] as Record<string, unknown>;

            // Check if this report exists in the original data to get its policyID
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            const originalReport = data[reportKey] as Record<string, unknown> | undefined;

            // If this report was already removed, or if it exists in original data with excluded policyID
            if (excludedReportIDs.has(reportID) || (originalReport && typeof originalReport.policyID === 'string' && excludedPolicyIDs.has(originalReport.policyID))) {
                delete reportTransactions[reportID];
            }
            // If masking is enabled and this is a paycheck report, remove it
            else if (isMaskingFragileDataEnabled && originalReport && originalReport.type === 'paycheck') {
                orphanedReportIDs.add(reportID); // Track for transaction removal
                delete reportTransactions[reportID];
            }
            // If report doesn't exist in collection, it's orphaned/stale data - track it and remove it
            else if (!originalReport) {
                orphanedReportIDs.add(reportID);
                delete reportTransactions[reportID];
            }
            // Otherwise, check if transactions within the report should be filtered
            else if (reportData && reportData.transactions && typeof reportData.transactions === 'object') {
                const transactions = reportData.transactions as Record<string, unknown>;
                Object.keys(transactions).forEach((transactionKey) => {
                    const transaction = transactions[transactionKey] as Record<string, unknown>;
                    // Check if this transaction belongs to an excluded report
                    if (transaction && typeof transaction.reportID === 'string' && excludedReportIDs.has(transaction.reportID)) {
                        delete transactions[transactionKey];
                    }
                });
            }
        });

        onyxState[ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS] = reportTransactions;
    }

    // Remove root-level transactions that belong to orphaned reports (or paycheck reports if masking enabled)
    if (orphanedReportIDs.size > 0) {
        Object.keys(onyxState).forEach((key) => {
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                const transaction = onyxState[key] as Record<string, unknown>;

                if (transaction && typeof transaction.reportID === 'string' && orphanedReportIDs.has(transaction.reportID)) {
                    delete onyxState[key];
                }
            }
        });
    }

    if (onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES] && typeof onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES] === 'object') {
        const reportAttributes = onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES] as Record<string, unknown>;
        if (reportAttributes.reports && typeof reportAttributes.reports === 'object') {
            const filteredReports: Record<string, unknown> = {};
            const reports = reportAttributes.reports as Record<string, unknown>;
            Object.keys(reports).forEach((reportID) => {
                // Check if report exists in original data
                const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
                const originalReport = data[reportKey] as Record<string, unknown> | undefined;

                // Skip if excluded, paycheck or orphaned
                const shouldRemove =
                    excludedReportIDs.has(reportID) || orphanedReportIDs.has(reportID) || (isMaskingFragileDataEnabled && originalReport && originalReport.type === 'paycheck');

                if (!shouldRemove) {
                    filteredReports[reportID] = reports[reportID];
                }
            });
            reportAttributes.reports = filteredReports;
        }
        onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES] = reportAttributes;
    }

    if (onyxState[ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID] && typeof onyxState[ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID] === 'object') {
        const outstandingReports = onyxState[ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID] as Record<string, unknown>;
        Object.keys(outstandingReports).forEach((policyID) => {
            if (excludedPolicyIDs.has(policyID)) {
                delete outstandingReports[policyID];
            }
        });
        onyxState[ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID] = outstandingReports;
    }

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
