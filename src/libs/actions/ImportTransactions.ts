import {addDays, format, isValid, parse} from 'date-fns';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ImportCSVTransactionsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import * as NumberUtils from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {ImportTransactionSettings} from '@src/types/onyx/ImportedSpreadsheet';
import type Transaction from '@src/types/onyx/Transaction';

type TransactionFromCSV = {
    created: string;
    merchant: string;
    amount: number;
    category?: string;
};

// Common date formats found in CSV files
const DATE_FORMATS = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'M/d/yyyy',
    'dd/MM/yyyy',
    'd/M/yyyy',
    'MM-dd-yyyy',
    'dd-MM-yyyy',
    'yyyy/MM/dd',
    'MMM d, yyyy',
    'MMMM d, yyyy',
    'd MMM yyyy',
    'dd MMM yyyy',
    'yyyyMMdd',
];

/**
 * Parses a date string from various formats and returns it in yyyy-MM-dd format
 * Similar to Web-Expensify's uploadcsv_validateDate function
 */
function parseCSVDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmedInput = input.trim();

    // Try parsing with each known format
    for (const dateFormat of DATE_FORMATS) {
        const parsedDate = parse(trimmedInput, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // Try native Date parsing as fallback (handles ISO 8601 and other standard formats)
    const nativeDate = new Date(trimmedInput);
    if (isValid(nativeDate) && !Number.isNaN(nativeDate.getTime())) {
        return format(nativeDate, CONST.DATE.FNS_FORMAT_STRING);
    }

    // Try parsing first 10 characters (some dates have extra time info)
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);
        for (const dateFormat of DATE_FORMATS) {
            const parsedDate = parse(shortInput, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    // Try parsing as Excel serial date number (days since 1900-01-01)
    // Excel thinks 1900 was a leap year, so we subtract 2 days
    if (/^\d+$/.test(trimmedInput)) {
        const excelDays = parseInt(trimmedInput, 10);
        if (excelDays > 0 && excelDays < 100000) {
            // Reasonable range for Excel dates
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const parsedDate = addDays(excelEpoch, excelDays - 2);
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    return null;
}

/**
 * Converts spreadsheet data to transaction objects based on column mapping
 */
function buildTransactionListFromSpreadsheet(spreadsheet: ImportedSpreadsheet, settings: ImportTransactionSettings): TransactionFromCSV[] {
    const {data, columns, containsHeader = true} = spreadsheet;
    const {flipAmountSign = false} = settings;

    // Find the column indexes for each field
    let dateColumnIndex = -1;
    let merchantColumnIndex = -1;
    let amountColumnIndex = -1;
    let categoryColumnIndex = -1;

    if (columns) {
        Object.entries(columns).forEach(([indexStr, role]) => {
            const index = Number(indexStr);
            switch (role) {
                case 'date':
                    dateColumnIndex = index;
                    break;
                case 'merchant':
                    merchantColumnIndex = index;
                    break;
                case 'amount':
                    amountColumnIndex = index;
                    break;
                case 'category':
                    categoryColumnIndex = index;
                    break;
                default:
                    break;
            }
        });
    }

    const transactions: TransactionFromCSV[] = [];
    const startIndex = containsHeader ? 1 : 0;

    // Data is in column-major format, so we need to iterate through columns
    if (!data || data.length === 0) {
        return transactions;
    }

    // Get the number of rows (length of first column)
    const numRows = data[0]?.length ?? 0;

    for (let rowIndex = startIndex; rowIndex < numRows; rowIndex++) {
        const dateValue = dateColumnIndex >= 0 ? data[dateColumnIndex]?.[rowIndex] : undefined;
        const merchantValue = merchantColumnIndex >= 0 ? data[merchantColumnIndex]?.[rowIndex] : undefined;
        const amountValue = amountColumnIndex >= 0 ? data[amountColumnIndex]?.[rowIndex] : undefined;
        const categoryValue = categoryColumnIndex >= 0 ? data[categoryColumnIndex]?.[rowIndex] : undefined;

        // Skip rows with missing required fields
        if (!dateValue || !amountValue) {
            continue;
        }

        // Parse the date using our multi-format parser
        const parsedDate = parseCSVDate(dateValue);

        // Skip rows with invalid dates
        if (!parsedDate) {
            continue;
        }

        // Parse amount - remove non-numeric characters except decimal and minus
        let parsedAmount = Math.round(Number(String(amountValue).replace(/[^\d.-]/g, '')) * 100);

        // Flip sign if needed
        if (flipAmountSign) {
            parsedAmount *= -1;
        }

        const transaction: TransactionFromCSV = {
            created: parsedDate,
            merchant: merchantValue ?? '',
            amount: parsedAmount,
        };

        if (categoryValue) {
            transaction.category = categoryValue;
        }

        transactions.push(transaction);
    }

    return transactions;
}

/**
 * Creates an optimistic card object for the imported transactions
 */
function buildOptimisticCard(cardDisplayName: string, currency: string): Card {
    const cardID = NumberUtils.generateRandomInt64();
    return {
        cardID,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: cardDisplayName,
        domainName: '',
        lastFourPAN: '',
        availableSpend: 0,
        scrapeMinDate: '',
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        cardholderFirstName: '',
        cardholderLastName: '',
        isVirtual: false,
        issuedAt: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        nameValuePairs: {
            cardTitle: cardDisplayName,
        },
    };
}

/**
 * Creates optimistic transaction objects from the CSV data
 */
function buildOptimisticTransactions(transactionList: TransactionFromCSV[], cardID: number, currency: string, isReimbursable: boolean): Transaction[] {
    return transactionList.map((csvTransaction) => {
        const transactionID = NumberUtils.generateRandomInt64().toString();
        return {
            transactionID,
            cardID,
            created: csvTransaction.created,
            merchant: csvTransaction.merchant,
            amount: csvTransaction.amount,
            currency,
            category: csvTransaction.category ?? '',
            reimbursable: isReimbursable,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            comment: {
                comment: '',
            },
            reportID: '0',
        } as Transaction;
    });
}

/**
 * Import transactions from a CSV spreadsheet
 */
function importTransactionsFromCSV(spreadsheet: ImportedSpreadsheet) {
    const settings = spreadsheet.importTransactionSettings ?? {};
    const {cardDisplayName = 'Imported Card', currency = CONST.CURRENCY.USD, isReimbursable = true} = settings;

    // Build transaction list from spreadsheet
    const transactionList = buildTransactionListFromSpreadsheet(spreadsheet, settings);

    if (transactionList.length === 0) {
        Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {
            shouldFinalModalBeOpened: true,
            importFinalModal: {
                titleKey: 'spreadsheet.importFailedTitle' as const,
                promptKey: 'spreadsheet.invalidFileMessage' as const,
                promptKeyParams: {},
            },
        });
        return;
    }

    // Create optimistic card
    const optimisticCard = buildOptimisticCard(cardDisplayName, currency);
    const cardID = optimisticCard.cardID;

    // Create optimistic transactions
    const optimisticTransactions = buildOptimisticTransactions(transactionList, cardID, currency, isReimbursable);

    // Build optimistic card list update
    const optimisticCardList: CardList = {
        [cardID]: optimisticCard,
    };

    const params: ImportCSVTransactionsParams = {
        transactionList: JSON.stringify(transactionList),
        cardID: 0, // 0 for new card
        cardName: cardDisplayName,
        currency,
        reimbursable: isReimbursable,
    };

    API.write(WRITE_COMMANDS.IMPORT_CSV_TRANSACTIONS, params, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: optimisticCardList,
            },
            ...optimisticTransactions.map((transaction) => ({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: transaction,
            })),
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importSuccessfulTitle' as const,
                        promptKey: 'spreadsheet.importTransactionsSuccessfulDescription' as const,
                        promptKeyParams: {transactions: transactionList.length},
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: null,
                },
            },
            ...optimisticTransactions.map((transaction) => ({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: null,
            })),
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importFailedTitle' as const,
                        promptKey: 'spreadsheet.importFailedDescription' as const,
                        promptKeyParams: {},
                    },
                },
            },
        ],
    });
}

export {importTransactionsFromCSV};
