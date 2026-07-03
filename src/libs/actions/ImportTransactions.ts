import * as API from '@libs/API';
import type {ImportCSVTransactionsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {generateCardID} from '@libs/CardUtils';
import parseCSVDate from '@libs/CSVDateUtils';
import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {ImportFinalModal, ImportTransactionSettings} from '@src/types/onyx/ImportedSpreadsheet';
import type {SavedCSVColumnLayoutData} from '@src/types/onyx/SavedCSVColumnLayout';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getImportFailedFinalModal, getImportFinalModalID, getImportFinalModalOnyxData, waitForImportFinalModal} from './ImportSpreadsheet';

type TransactionFromCSV = {
    transactionID: string;
    created: string;
    merchant: string;
    amount: number;
    category?: string;
};

type ColumnIndexes = {
    date: number;
    merchant: number;
    amount: number;
    category: number;
};

type TransactionField = 'date' | 'merchant' | 'amount' | 'category';

/**
 * Type guard to check if a string is a valid transaction field
 */
function isTransactionField(value: string): value is TransactionField {
    return CONST.CSV_IMPORT_COLUMNS.TRANSACTION_FIELDS.includes(value as TransactionField);
}

/**
 * Extracts the column indexes for each transaction attribute from the spreadsheet column mapping
 */
function getColumnIndexes(columns: Record<number, string> | undefined): ColumnIndexes {
    const indexes: ColumnIndexes = {
        date: -1,
        merchant: -1,
        amount: -1,
        category: -1,
    };

    if (columns) {
        for (const [indexStr, role] of Object.entries(columns)) {
            const index = Number(indexStr);
            if (isTransactionField(role)) {
                indexes[role] = index;
            }
        }
    }

    return indexes;
}

/**
 * Builds the full column layout structure for oldDot compatibility
 */
function buildColumnLayout(spreadsheet: ImportedSpreadsheet, cardName: string, currency: string, isReimbursable: boolean, flipAmountSign: boolean): SavedCSVColumnLayoutData {
    const {data, columns, containsHeader = true} = spreadsheet;

    const indexes: SavedCSVColumnLayoutData['columnMapping']['indexes'] = {
        date: false,
        amount: false,
        merchant: false,
        category: false,
        type: false,
    };
    const names: SavedCSVColumnLayoutData['columnMapping']['names'] = {
        date: false,
        amount: false,
        merchant: false,
        category: false,
        type: false,
    };

    if (columns) {
        for (const [indexStr, role] of Object.entries(columns)) {
            if (isTransactionField(role)) {
                const colIndex = Number(indexStr);
                indexes[role] = colIndex;

                if (containsHeader && data && colIndex >= 0 && colIndex < data.length) {
                    const headerName = data.at(colIndex)?.at(0);
                    if (headerName) {
                        names[role] = headerName;
                    }
                }
            }
        }
    }

    return {
        name: cardName,
        useTypeColumn: false,
        flipAmountSign,
        reimbursable: isReimbursable,
        offset: 0,
        dateFormat: null,
        accountDetails: {
            bank: CONST.PERSONAL_CARDS.BANK_NAME.CSV,
            currency,
            accountID: cardName,
        },
        columnMapping: {
            names,
            indexes,
        },
    };
}

/**
 * Converts spreadsheet data to transaction objects based on column mapping
 */
function buildTransactionListFromSpreadsheet(spreadsheet: ImportedSpreadsheet, settings: ImportTransactionSettings): TransactionFromCSV[] {
    const {data, columns, containsHeader = true} = spreadsheet;
    const {flipAmountSign = false} = settings;

    // Find the column indexes for each field
    const {date: dateColumnIndex, merchant: merchantColumnIndex, amount: amountColumnIndex, category: categoryColumnIndex} = getColumnIndexes(columns);

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
function buildOptimisticCard(cardDisplayName: string, accountID: number): {card: Card; cardID: number} {
    const cardID = generateCardID();
    return {
        cardID,
        card: {
            cardID,
            // A personal card always belongs to the current (importing) user, so set the accountID optimistically
            // to keep the cardholder lookup (personalDetails[accountID]) working on the card details page.
            accountID,
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            // Use the CSV bank name constant so the card shows up in the Assigned Cards section
            bank: CONST.PERSONAL_CARDS.BANK_NAME.CSV,
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
 * @param accountID - The current (importing) user's accountID, used as the cardholder for a new optimistic card
 * @param existingCardID - Optional cardID to add transactions to an existing card instead of creating a new one
 * @param previouslySavedLayout - Optional previous saved layout to restore on failure
 */
async function importTransactionsFromCSV(
    spreadsheet: ImportedSpreadsheet,
    accountID: number,
    existingCardID?: number,
    previouslySavedLayout?: SavedCSVColumnLayoutData,
): Promise<ImportFinalModal> {
    const settings = spreadsheet.importTransactionSettings ?? {};
    const {cardDisplayName = 'Imported Card', currency = CONST.CURRENCY.USD, isReimbursable = true, flipAmountSign = false} = settings;

    // Build transaction list from spreadsheet
    const transactionList = buildTransactionListFromSpreadsheet(spreadsheet, settings);

    if (transactionList.length === 0) {
        return {
            titleKey: 'spreadsheet.importFailedTitle',
            promptKey: 'spreadsheet.invalidFileMessage',
        };
    }

    // Use existing cardID if provided, otherwise create a new optimistic card
    const isAddingToExistingCard = !!existingCardID;
    let cardID: number;
    let optimisticCard: Card | undefined;

    if (isAddingToExistingCard) {
        cardID = existingCardID;
    } else {
        const optimisticCardData = buildOptimisticCard(cardDisplayName, accountID);
        cardID = optimisticCardData.cardID;
        optimisticCard = optimisticCardData.card;
    }

    // Create optimistic transactions
    const optimisticTransactions = buildOptimisticTransactions(transactionList, cardID, currency, isReimbursable);

    // Build full column layout for oldDot compatibility
    const columnLayout = buildColumnLayout(spreadsheet, cardDisplayName, currency, isReimbursable, flipAmountSign);

    const params: ImportCSVTransactionsParams = {
        transactionList: JSON.stringify(transactionList),
        cardID,
        cardName: cardDisplayName,
        currency,
        reimbursable: isReimbursable,
        columnMappings: JSON.stringify(columnLayout),
    };

    const importFinalModal: ImportFinalModal = {
        titleKey: 'spreadsheet.importSuccessfulTitle',
        promptKey: 'spreadsheet.importTransactionsSuccessfulDescription',
        promptKeyParams: {transactions: transactionList.length},
    };
    const importFinalModalID = getImportFinalModalID();
    const importFinalModalResult = waitForImportFinalModal(importFinalModalID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.CARD_LIST | typeof ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IMPORTED_SPREADSHEET>> = [getImportFinalModalOnyxData(importFinalModalID, importFinalModal)];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.CARD_LIST | typeof ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST | typeof ONYXKEYS.IMPORTED_SPREADSHEET>
    > = [getImportFinalModalOnyxData(importFinalModalID, getImportFailedFinalModal())];

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

    // Optimistically save the column layout for this card (replaces entire entry)
    // First clear any existing entry, then set the new one to match backend behavior
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST,
        value: {[cardID]: null},
    });
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST,
        value: {[cardID]: columnLayout},
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

    // Restore the previous saved layout on failure, or null if none existed
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST,
        value: {
            [cardID]: previouslySavedLayout ?? null,
        },
    });

    try {
        await API.write(WRITE_COMMANDS.IMPORT_CSV_TRANSACTIONS, params, {
            optimisticData,
            successData,
            failureData,
        });
        return await importFinalModalResult.promise;
    } catch {
        importFinalModalResult.cancel();
        return getImportFailedFinalModal();
    }
}

export {getColumnIndexes, buildColumnLayout, buildTransactionListFromSpreadsheet};
export default importTransactionsFromCSV;
