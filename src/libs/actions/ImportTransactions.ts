import {addDays, format, isValid, parse} from 'date-fns';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ImportCSVTransactionsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {generateCardID} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {ImportTransactionSettings} from '@src/types/onyx/ImportedSpreadsheet';
import type Transaction from '@src/types/onyx/Transaction';

type TransactionFromCSV = {
    transactionID: string;
    created: string;
    merchant: string;
    amount: number;
    category?: string;
};

// Common date formats to try when parsing CSV dates
// Order matters - more specific/common formats first
const CSV_DATE_FORMATS = [
    'yyyy-MM-dd', // ISO format: 2025-11-02
    'MM/dd/yyyy', // US format: 11/02/2025
    'dd/MM/yyyy', // European format: 02/11/2025
    'M/d/yyyy', // US short: 1/2/2025
    'd/M/yyyy', // European short: 2/1/2025
    'MM-dd-yyyy', // US with dashes: 11-02-2025
    'dd-MM-yyyy', // European with dashes: 02-11-2025
    'yyyy/MM/dd', // Alternative ISO: 2025/11/02
    'MMM d, yyyy', // Month name: Nov 2, 2025
    'MMMM d, yyyy', // Full month: November 2, 2025
    'd MMM yyyy', // European with month name: 2 Nov 2025
    'dd MMM yyyy', // European with month name: 02 Nov 2025
    'yyyyMMdd', // Compact: 20251102
];

/**
 * Parses a date string from various formats and returns it in yyyy-MM-dd format
 */
function parseCSVDate(input: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmedInput = input.trim();

    // Try native Date parsing first (handles ISO and some other formats)
    let date = new Date(trimmedInput);
    if (isValid(date) && !Number.isNaN(date.getTime())) {
        return format(date, CONST.DATE.FNS_FORMAT_STRING);
    }

    // Try parsing with common date formats using date-fns
    for (const dateFormat of CSV_DATE_FORMATS) {
        const parsedDate = parse(trimmedInput, dateFormat, new Date());
        if (isValid(parsedDate)) {
            return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
        }
    }

    // If the date didn't parse, try taking just the first 10 characters
    if (trimmedInput.length > 10) {
        const shortInput = trimmedInput.substring(0, 10);
        date = new Date(shortInput);
        if (isValid(date) && !Number.isNaN(date.getTime())) {
            return format(date, CONST.DATE.FNS_FORMAT_STRING);
        }
        // Also try format parsing on the shortened input
        for (const dateFormat of CSV_DATE_FORMATS) {
            const parsedDate = parse(shortInput, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return format(parsedDate, CONST.DATE.FNS_FORMAT_STRING);
            }
        }
    }

    // If it didn't parse, maybe it's an Excel date number
    // Excel stores dates serialized from January 1st, 1900 (with 1/1/1900 being 1)
    // Excel thinks that 1900 was a leap year and adds an extra day to account for that
    if (/^\d+$/.test(trimmedInput)) {
        const inputInt = parseInt(trimmedInput, 10);
        if (inputInt > 0 && inputInt < 100000) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const parsedDate = addDays(excelEpoch, inputInt - 2);
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
        for (const [indexStr, role] of Object.entries(columns)) {
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
        }
    }

    const transactions: TransactionFromCSV[] = [];
    const startIndex = containsHeader ? 1 : 0;

    // Data is in column-major format, so we need to iterate through columns
    if (!data || data.length === 0) {
        return transactions;
    }

    // Get the number of rows (length of first column)
    const numRows = data.at(0)?.length ?? 0;

    for (let rowIndex = startIndex; rowIndex < numRows; rowIndex++) {
        const dateValue = dateColumnIndex >= 0 ? data.at(dateColumnIndex)?.at(rowIndex) : undefined;
        const merchantValue = merchantColumnIndex >= 0 ? data.at(merchantColumnIndex)?.at(rowIndex) : undefined;
        const amountValue = amountColumnIndex >= 0 ? data.at(amountColumnIndex)?.at(rowIndex) : undefined;
        const categoryValue = categoryColumnIndex >= 0 ? data.at(categoryColumnIndex)?.at(rowIndex) : undefined;

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
        let parsedAmount = Math.round(Number(String(amountValue).replaceAll(/[^\d.-]/g, '')) * 100);

        // Flip sign if needed
        if (flipAmountSign) {
            parsedAmount *= -1;
        }

        const transaction: TransactionFromCSV = {
            transactionID: rand64(),
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
function buildOptimisticCard(cardDisplayName: string): {card: Card; cardID: number} {
    const cardID = generateCardID();
    return {
        cardID,
        card: {
            cardID,
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            // Use the CSV bank name constant so the card shows up in the Assigned Cards section
            bank: CONST.PERSONAL_CARD.BANK_NAME.CSV,
            domainName: '',
            lastFourPAN: '',
            availableSpend: 0,
            scrapeMinDate: '',
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: DateUtils.getDBTime(),
            nameValuePairs: {
                cardTitle: cardDisplayName,
            } as Card['nameValuePairs'],
        },
    };
}

/**
 * Creates optimistic transaction objects from the CSV data
 */
function buildOptimisticTransactions(transactionList: TransactionFromCSV[], cardID: number, currency: string, isReimbursable: boolean): Transaction[] {
    return transactionList.map(
        (csvTransaction) =>
            ({
                transactionID: csvTransaction.transactionID,
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
            }) as Transaction,
    );
}

/**
 * Import transactions from a CSV spreadsheet
 * @param spreadsheet - The imported spreadsheet data
 * @param existingCardID - Optional cardID to add transactions to an existing card instead of creating a new one
 */
function importTransactionsFromCSV(spreadsheet: ImportedSpreadsheet, existingCardID?: number) {
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
                promptKeyParams: undefined,
            },
        });
        return;
    }

    // Use existing cardID if provided, otherwise create a new optimistic card
    const isAddingToExistingCard = !!existingCardID;
    let cardID: number;
    let optimisticCard: Card | undefined;

    if (isAddingToExistingCard) {
        cardID = existingCardID;
    } else {
        const optimisticCardData = buildOptimisticCard(cardDisplayName);
        cardID = optimisticCardData.cardID;
        optimisticCard = optimisticCardData.card;
    }

    // Create optimistic transactions
    const optimisticTransactions = buildOptimisticTransactions(transactionList, cardID, currency, isReimbursable);

    const params: ImportCSVTransactionsParams = {
        transactionList: JSON.stringify(transactionList),
        cardID,
        cardName: cardDisplayName,
        currency,
        reimbursable: isReimbursable,
    };

    const optimisticData = [] as OnyxUpdate[];
    const failureData = [] as OnyxUpdate[];

    // Only add card to optimistic data if we're creating a new card
    if (!isAddingToExistingCard && optimisticCard) {
        const optimisticCardList: CardList = {
            [cardID]: optimisticCard,
        };
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: optimisticCardList,
        });
    }

    for (const transaction of optimisticTransactions) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: null,
        });
    }

    optimisticData.push({
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
    });

    // Only add card cleanup to failure data if we created a new card
    if (!isAddingToExistingCard) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: null,
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.IMPORTED_SPREADSHEET,
        value: {
            shouldFinalModalBeOpened: true,
            importFinalModal: {
                titleKey: 'spreadsheet.importFailedTitle' as const,
                promptKey: 'spreadsheet.importFailedDescription' as const,
                promptKeyParams: undefined,
            },
        },
    });

    API.write(WRITE_COMMANDS.IMPORT_CSV_TRANSACTIONS, params, {
        optimisticData,
        failureData,
    });
}

export default importTransactionsFromCSV;
