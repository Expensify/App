import {applySavedColumnMappings, getImportFinalModalOnyxData} from '@libs/actions/ImportSpreadsheet';
import importTransactionsFromCSV, {
    buildColumnLayout,
    buildTransactionListFromSpreadsheet,
    getColumnIndexes,
    getExistingCardImportSettings,
    hasTagExceedingMaxLength,
    uploadOFXStatement,
} from '@libs/actions/ImportTransactions';
import * as API from '@libs/API';
import {getCompanyCardColumnMappings} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {SavedCSVColumnLayoutData} from '@src/types/onyx/SavedCSVColumnLayout';

/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {getRequiredOnyxUpdate, getRequiredOnyxUpdates, getRequiredWriteCall} from '../utils/TestHelper';

let writeSpy: jest.SpiedFunction<typeof API.write>;

describe('ImportTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on Onyx.merge for tests that need to verify it was called
        jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
        writeSpy = jest.spyOn(API, 'write').mockRejectedValue(new Error('forced'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getColumnIndexes', () => {
        it('should return all -1 when columns is undefined', () => {
            const result = getColumnIndexes(undefined);
            expect(result).toEqual({
                date: -1,
                merchant: -1,
                amount: -1,
                category: -1,
                tag: -1,
            });
        });

        it('should return all -1 when columns is empty', () => {
            const result = getColumnIndexes({});
            expect(result).toEqual({
                date: -1,
                merchant: -1,
                amount: -1,
                category: -1,
                tag: -1,
            });
        });

        it('should extract correct indexes for valid columns', () => {
            const columns = {
                0: 'date',
                1: 'merchant',
                2: 'amount',
                3: 'category',
            };
            const result = getColumnIndexes(columns);
            expect(result).toEqual({
                date: 0,
                merchant: 1,
                amount: 2,
                category: 3,
                tag: -1,
            });
        });

        it('should include the tag column index', () => {
            // Given a spreadsheet where one column is mapped to Tag
            const columns = {
                0: 'date',
                1: 'merchant',
                2: 'amount',
                3: 'tag',
            };

            // When the column indexes are extracted
            const result = getColumnIndexes(columns);

            // Then the tag index is returned so the tag values are read from that column
            expect(result.tag).toBe(3);
        });

        it('should handle sparse column mappings', () => {
            const columns = {
                0: 'ignore',
                2: 'date',
                5: 'amount',
            };
            const result = getColumnIndexes(columns);
            expect(result).toEqual({
                date: 2,
                merchant: -1,
                amount: 5,
                category: -1,
                tag: -1,
            });
        });

        it('should ignore non-transaction columns', () => {
            const columns = {
                0: 'date',
                1: 'ignore',
                2: 'amount',
                3: 'someOtherColumn',
            };
            const result = getColumnIndexes(columns);
            expect(result).toEqual({
                date: 0,
                merchant: -1,
                amount: 2,
                category: -1,
                tag: -1,
            });
        });
    });

    describe('hasTagExceedingMaxLength', () => {
        const buildSpreadsheet = (tagValues: string[], columns: Record<number, string>) =>
            createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', ...tagValues.map(() => '2024-01-15')],
                    ['Merchant', ...tagValues.map(() => 'Store')],
                    ['Amount', ...tagValues.map(() => '10.00')],
                    ['Tag', ...tagValues],
                ],
                columns,
                containsHeader: true,
            });

        it('should return false when no column is mapped to Tag', () => {
            // Given a long value in a column that isn't mapped to Tag
            const spreadsheet = buildSpreadsheet(['a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH + 1)], {0: 'date', 1: 'merchant', 2: 'amount', 3: 'ignore'});

            // When the tag length is checked
            // Then nothing is flagged, because the value is not imported
            expect(hasTagExceedingMaxLength(spreadsheet)).toBe(false);
        });

        it('should return false when every tag is within the limit', () => {
            // Given tags that are at most the maximum length
            const spreadsheet = buildSpreadsheet(['Visa', 'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH)], {0: 'date', 1: 'merchant', 2: 'amount', 3: 'tag'});

            // When the tag length is checked
            // Then nothing is flagged
            expect(hasTagExceedingMaxLength(spreadsheet)).toBe(false);
        });

        it('should return true when a tag is longer than the limit', () => {
            // Given one tag that is longer than the API accepts
            const spreadsheet = buildSpreadsheet(['Visa', 'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH + 1)], {0: 'date', 1: 'merchant', 2: 'amount', 3: 'tag'});

            // When the tag length is checked
            // Then it is flagged so the user can fix the file before importing instead of the import failing on the server
            expect(hasTagExceedingMaxLength(spreadsheet)).toBe(true);
        });

        it('should return false when the long tag is only on a row that is skipped during import', () => {
            // Given a long tag on a footer row with no date or amount, and another on a row with an invalid date
            const longTag = 'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH + 1);
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', 'not a date', ''],
                    ['Merchant', 'Store', 'Store', 'Total'],
                    ['Amount', '10.00', '5.00', ''],
                    ['Tag', 'Visa', longTag, longTag],
                ],
                columns: {0: 'date', 1: 'merchant', 2: 'amount', 3: 'tag'},
                containsHeader: true,
            });

            // When the tag length is checked
            // Then nothing is flagged, because those rows are never sent to the API
            expect(hasTagExceedingMaxLength(spreadsheet)).toBe(false);
        });
    });

    describe('getImportFinalModalOnyxData', () => {
        it('should build an imported spreadsheet update with the modal result ID and payload', () => {
            const importFinalModal = {
                titleKey: 'spreadsheet.importSuccessfulTitle' as const,
                promptKey: 'spreadsheet.importTransactionsSuccessfulDescription' as const,
                promptKeyParams: {count: 3},
            };

            expect(getImportFinalModalOnyxData('import-result-1', importFinalModal)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    importFinalModalID: 'import-result-1',
                    importFinalModal,
                },
            });
        });
    });

    describe('buildColumnLayout', () => {
        it('should build a basic layout with no column mappings', () => {
            const spreadsheet: ImportedSpreadsheet = {
                data: [],
                columns: {},
                containsHeader: true,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const result = buildColumnLayout(spreadsheet, 'Test Card', 'USD', true, false);

            expect(result).toEqual({
                name: 'Test Card',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: CONST.PERSONAL_CARDS.BANK_NAME.CSV,
                    currency: 'USD',
                    accountID: 'Test Card',
                },
                columnMapping: {
                    names: {
                        date: false,
                        amount: false,
                        merchant: false,
                        category: false,
                        tag: false,
                        type: false,
                    },
                    indexes: {
                        date: false,
                        amount: false,
                        merchant: false,
                        category: false,
                        tag: false,
                        type: false,
                    },
                },
            });
        });

        it('should build layout with column mappings and extract header names', () => {
            const spreadsheet: ImportedSpreadsheet = {
                data: [
                    ['Date', '2024-01-01', '2024-01-02'],
                    ['Merchant', 'Store A', 'Store B'],
                    ['Amount', '10.00', '20.00'],
                    ['Category', 'Food', 'Travel'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'category',
                },
                containsHeader: true,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const result = buildColumnLayout(spreadsheet, 'My Card', 'EUR', false, true);

            expect(result.name).toBe('My Card');
            expect(result.flipAmountSign).toBe(true);
            expect(result.reimbursable).toBe(false);
            expect(result.accountDetails.currency).toBe('EUR');
            expect(result.columnMapping.indexes).toEqual({
                date: 0,
                merchant: 1,
                amount: 2,
                category: 3,
                tag: false,
                type: false,
            });
            expect(result.columnMapping.names).toEqual({
                date: 'Date',
                merchant: 'Merchant',
                amount: 'Amount',
                category: 'Category',
                tag: false,
                type: false,
            });
        });

        it('should save the tag column index and header name', () => {
            // Given a spreadsheet with a column mapped to Tag
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-01'],
                    ['Merchant', 'Store A'],
                    ['Amount', '10.00'],
                    ['Card', 'Visa'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'tag',
                },
                containsHeader: true,
            });

            // When the column layout is built
            const result = buildColumnLayout(spreadsheet, 'Card', 'USD', true, false);

            // Then the tag mapping is saved so it can be restored when a file is uploaded again to the same card
            expect(result.columnMapping.indexes.tag).toBe(3);
            expect(result.columnMapping.names.tag).toBe('Card');
        });

        it('should handle missing headers when containsHeader is false', () => {
            const spreadsheet: ImportedSpreadsheet = {
                data: [
                    ['2024-01-01', '2024-01-02'],
                    ['Store A', 'Store B'],
                    ['10.00', '20.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: false,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const result = buildColumnLayout(spreadsheet, 'Card', 'USD', true, false);

            expect(result.columnMapping.indexes).toEqual({
                date: 0,
                merchant: 1,
                amount: 2,
                category: false,
                tag: false,
                type: false,
            });
            // Names should be false when no header
            expect(result.columnMapping.names).toEqual({
                date: false,
                merchant: false,
                amount: false,
                category: false,
                tag: false,
                type: false,
            });
        });

        it('should handle out of bounds column indexes gracefully', () => {
            const spreadsheet: ImportedSpreadsheet = {
                data: [
                    ['Date', '2024-01-01'],
                    ['Merchant', 'Store A'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    10: 'amount', // Out of bounds
                },
                containsHeader: true,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const result = buildColumnLayout(spreadsheet, 'Card', 'USD', true, false);

            expect(result.columnMapping.indexes.date).toBe(0);
            expect(result.columnMapping.indexes.merchant).toBe(1);
            expect(result.columnMapping.indexes.amount).toBe(10);
            // Header name for out of bounds should be false
            expect(result.columnMapping.names.amount).toBe(false);
        });
    });

    describe('buildTransactionListFromSpreadsheet', () => {
        it('should return empty array when data is empty', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toEqual([]);
        });

        it('should build transactions from valid spreadsheet data', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', '2024-01-20'],
                    ['Merchant', 'Coffee Shop', 'Restaurant'],
                    ['Amount', '5.50', '25.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)).toMatchObject({
                created: '2024-01-15',
                merchant: 'Coffee Shop',
                amount: 550, // In cents
            });
            expect(result.at(1)).toMatchObject({
                created: '2024-01-20',
                merchant: 'Restaurant',
                amount: 2500,
            });
            // Check that transactionIDs are generated
            const firstTransaction = result.at(0);
            const secondTransaction = result.at(1);
            expect(firstTransaction?.transactionID).toBeTruthy();
            expect(secondTransaction?.transactionID).toBeTruthy();
            expect(firstTransaction?.transactionID).not.toBe(secondTransaction?.transactionID);
        });

        it('should include category when provided', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15'],
                    ['Merchant', 'Store'],
                    ['Amount', '10.00'],
                    ['Category', 'Office Supplies'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'category',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.category).toBe('Office Supplies');
        });

        it('should include tag when provided', () => {
            // Given a spreadsheet with a column mapped to Tag, including a multi-level tag and an empty value
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', '2024-01-16', '2024-01-17'],
                    ['Merchant', 'Store', 'Store', 'Store'],
                    ['Amount', '10.00', '20.00', '30.00'],
                    ['Tag', 'Visa', 'Dept:Project', ''],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'tag',
                },
                containsHeader: true,
            });

            // When the transactions are built
            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            // Then each row carries its tag as-is, so a colon-delimited value becomes a multi-level tag, and an empty value adds no tag
            expect(result).toHaveLength(3);
            expect(result.at(0)?.tag).toBe('Visa');
            expect(result.at(1)?.tag).toBe('Dept:Project');
            expect(result.at(2)?.tag).toBeUndefined();
        });

        it('should skip rows with missing required fields (date or amount)', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', '', '2024-01-20'],
                    ['Merchant', 'Store A', 'Store B', 'Store C'],
                    ['Amount', '10.00', '20.00', ''],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            // Should only have 1 transaction (row 1), skipping rows 2 (no date) and 3 (no amount)
            expect(result).toHaveLength(1);
            expect(result.at(0)?.merchant).toBe('Store A');
        });

        it('should flip amount sign when flipAmountSign is true', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15'],
                    ['Merchant', 'Store'],
                    ['Amount', '10.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {flipAmountSign: true});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.amount).toBe(-1000); // Flipped
        });

        it('should handle amounts with currency symbols and commas', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', '2024-01-16'],
                    ['Merchant', 'Store A', 'Store B'],
                    ['Amount', '$1,234.56', '€999.99'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)?.amount).toBe(123456); // $1,234.56 in cents
            expect(result.at(1)?.amount).toBe(99999); // €999.99 in cents
        });

        it('should handle negative amounts', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15'],
                    ['Merchant', 'Refund'],
                    ['Amount', '-50.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.amount).toBe(-5000);
        });

        it('should work with containsHeader false', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['2024-01-15', '2024-01-16'],
                    ['Store A', 'Store B'],
                    ['10.00', '20.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: false,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)).toMatchObject({
                created: '2024-01-15',
                merchant: 'Store A',
                amount: 1000,
            });
        });

        it('should handle various date formats', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', '01/20/2024', '20-01-2024', 'Jan 25, 2024'],
                    ['Merchant', 'A', 'B', 'C', 'D'],
                    ['Amount', '10', '20', '30', '40'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(4);
            expect(result.at(0)?.created).toBe('2024-01-15');
            expect(result.at(1)?.created).toBe('2024-01-20');
            expect(result.at(2)?.created).toBe('2024-01-20');
            expect(result.at(3)?.created).toBe('2024-01-25');
        });

        it('should skip rows with invalid dates', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15', 'invalid-date', '2024-01-20'],
                    ['Merchant', 'Store A', 'Store B', 'Store C'],
                    ['Amount', '10.00', '20.00', '30.00'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)?.merchant).toBe('Store A');
            expect(result.at(1)?.merchant).toBe('Store C');
        });

        it('should handle missing merchant gracefully', () => {
            const spreadsheet = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15'],
                    ['Amount', '10.00'],
                    ['Category', 'Food'],
                ],
                columns: {
                    0: 'date',
                    1: 'amount',
                    // No merchant column mapped
                },
                containsHeader: true,
            });

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.merchant).toBe('');
        });
    });

    describe('applySavedColumnMappings', () => {
        it('should not apply mappings when columnMapping is missing', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store'],
            ];
            const savedLayout = createMock<SavedCSVColumnLayoutData>({
                name: 'Test',
                columnMapping: {},
            });

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).not.toHaveBeenCalled();
        });

        it('should not apply mappings when names is missing', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store'],
            ];
            const savedLayout = createMock<SavedCSVColumnLayoutData>({
                name: 'Test',
                columnMapping: {
                    indexes: {},
                },
            });

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).not.toHaveBeenCalled();
        });

        it('should apply saved column mappings based on header names', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01', '2024-01-02'],
                ['Merchant', 'Store A', 'Store B'],
                ['Total', '10.00', '20.00'],
                ['Category', 'Food', 'Travel'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test Card',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Date',
                        merchant: 'Merchant',
                        amount: 'Total',
                        category: 'Category',
                        type: false,
                    },
                    indexes: {
                        date: 0,
                        merchant: 1,
                        amount: 2,
                        category: 3,
                        type: false,
                    },
                },
            };

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).toHaveBeenCalledWith(ONYXKEYS.IMPORTED_SPREADSHEET, {
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'category',
                },
            });
        });

        it('should reapply a saved tag mapping', () => {
            // Given a card whose saved layout mapped the "Card" header to Tag
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store A'],
                ['Amount', '10.00'],
                ['Card', 'Visa'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test Card',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Date',
                        merchant: 'Merchant',
                        amount: 'Amount',
                        tag: 'Card',
                    },
                    indexes: {
                        date: 0,
                        merchant: 1,
                        amount: 2,
                        tag: 3,
                    },
                },
            };

            // When a new file is uploaded to the same card
            applySavedColumnMappings(spreadsheetData, savedLayout);

            // Then the Tag mapping is restored so the user doesn't have to map it again
            expect(Onyx.merge).toHaveBeenCalledWith(ONYXKEYS.IMPORTED_SPREADSHEET, {
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'tag',
                },
            });
        });

        it('should handle case-sensitive header matching with trim', () => {
            const spreadsheetData = [
                ['  Date  ', '2024-01-01'],
                ['Merchant', 'Store'],
                ['Amount', '10.00'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Date', // Should match '  Date  ' after trim
                        merchant: 'Merchant',
                        amount: 'Amount',
                        category: false,
                        type: false,
                    },
                    indexes: {
                        date: false,
                        merchant: false,
                        amount: false,
                        category: false,
                        type: false,
                    },
                },
            };

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).toHaveBeenCalledWith(ONYXKEYS.IMPORTED_SPREADSHEET, {
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
            });
        });

        it('should skip columns where saved name is not a string', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store'],
                ['Amount', '10.00'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Date',
                        merchant: false, // Not a string
                        amount: 'Amount',
                        category: false,
                        type: false,
                    },
                    indexes: {
                        date: false,
                        merchant: false,
                        amount: false,
                        category: false,
                        type: false,
                    },
                },
            };

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).toHaveBeenCalledWith(ONYXKEYS.IMPORTED_SPREADSHEET, {
                columns: {
                    0: 'date',
                    2: 'amount',
                    // merchant is skipped because its saved name is false
                },
            });
        });

        it('should handle partial matches when some headers are not found', () => {
            const spreadsheetData = [
                ['Transaction Date', '2024-01-01'],
                ['Store Name', 'Store'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Transaction Date',
                        merchant: 'Merchant Name', // Does not exist in spreadsheet
                        amount: 'Amount', // Does not exist
                        category: false,
                        type: false,
                    },
                    indexes: {
                        date: false,
                        merchant: false,
                        amount: false,
                        category: false,
                        type: false,
                    },
                },
            };

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).toHaveBeenCalledWith(ONYXKEYS.IMPORTED_SPREADSHEET, {
                columns: {
                    0: 'date',
                    // Only date is mapped because merchant and amount headers don't match
                },
            });
        });

        it('should not call Onyx.merge when no columns can be mapped', () => {
            const spreadsheetData = [
                ['Col1', 'value1'],
                ['Col2', 'value2'],
            ];
            const savedLayout: SavedCSVColumnLayoutData = {
                name: 'Test',
                useTypeColumn: false,
                flipAmountSign: false,
                reimbursable: true,
                offset: 0,
                dateFormat: null,
                accountDetails: {
                    bank: 'CSV',
                    currency: 'USD',
                    accountID: 'test',
                },
                columnMapping: {
                    names: {
                        date: 'Date',
                        merchant: 'Merchant',
                        amount: 'Amount',
                        category: 'Category',
                        type: false,
                    },
                    indexes: {
                        date: false,
                        merchant: false,
                        amount: false,
                        category: false,
                        type: false,
                    },
                },
            };

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).not.toHaveBeenCalled();
        });
    });

    describe('getCompanyCardColumnMappings', () => {
        const availableRoles = [
            CONST.CSV_IMPORT_COLUMNS.IGNORE,
            CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
            CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
            CONST.CSV_IMPORT_COLUMNS.MERCHANT,
            CONST.CSV_IMPORT_COLUMNS.AMOUNT,
            CONST.CSV_IMPORT_COLUMNS.CURRENCY,
        ];

        it('should map columns from their headers regardless of column order', () => {
            // Column-major spreadsheet data (each entry is a column, index 0 is the header)
            const spreadsheetData = [
                ['Merchant', 'Store A', 'Store B'],
                ['Amount', '10.00', '20.00'],
                ['Card Number', '4111', '4111'],
                ['Currency', 'USD', 'USD'],
                ['Posted Date', '2024-01-01', '2024-01-02'],
            ];

            const columns = getCompanyCardColumnMappings(spreadsheetData, undefined, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.MERCHANT,
                1: CONST.CSV_IMPORT_COLUMNS.AMOUNT,
                2: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
                3: CONST.CSV_IMPORT_COLUMNS.CURRENCY,
                4: CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
            });
        });

        it('should never assign the same property to more than one column when several headers match it', () => {
            // Both "Card" and "Number" auto-detect to CARD_NUMBER - only the first column may claim it.
            const spreadsheetData = [
                ['Card', '4111'],
                ['Number', '5222'],
                ['Amount', '10.00'],
                ['Currency', 'USD'],
            ];

            const columns = getCompanyCardColumnMappings(spreadsheetData, undefined, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
                1: CONST.CSV_IMPORT_COLUMNS.IGNORE,
                2: CONST.CSV_IMPORT_COLUMNS.AMOUNT,
                3: CONST.CSV_IMPORT_COLUMNS.CURRENCY,
            });
        });

        it('should remap a "Date" header to POSTED_DATE when DATE is not a selectable role', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store A'],
            ];

            const columns = getCompanyCardColumnMappings(spreadsheetData, undefined, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
                1: CONST.CSV_IMPORT_COLUMNS.MERCHANT,
            });
        });

        it('should use the saved layout only as a fallback for roles the headers did not resolve, without overriding or duplicating', () => {
            // A re-imported file with a DIFFERENT structure: only Merchant/Amount have recognizable headers.
            const spreadsheetData = [
                ['Txn', 'x'],
                ['Merchant', 'Store A'],
                ['Amount', '10.00'],
                ['Custom1', 'y'],
                ['Custom2', 'z'],
            ];
            // Saved mapping comes from the first (differently-structured) file, keyed by role with an index value.
            const savedColumnMappings = {
                // Header at index 0 is unrecognized, so the fallback fills cardNumber there.
                cardNumber: '0',
                // Merchant/amount are already resolved from headers, so these saved entries are ignored (no duplicate).
                merchant: '3',
                amount: '4',
                // Currency was not resolved from a header, and index 3 is still unmapped, so it is filled here.
                currency: '3',
            };

            const columns = getCompanyCardColumnMappings(spreadsheetData, savedColumnMappings, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
                1: CONST.CSV_IMPORT_COLUMNS.MERCHANT,
                2: CONST.CSV_IMPORT_COLUMNS.AMOUNT,
                3: CONST.CSV_IMPORT_COLUMNS.CURRENCY,
                4: CONST.CSV_IMPORT_COLUMNS.IGNORE,
            });
        });

        it('should skip ignore/unavailable roles, out-of-range indexes, and already-claimed columns in the fallback', () => {
            const spreadsheetData = [
                ['Card', '4111'],
                ['Foo', 'x'],
                ['Bar', 'y'],
            ];
            const savedColumnMappings = {
                // The ignore role is never applied.
                ignore: '1',
                // Advanced field not available when advanced fields are disabled.
                originalAmount: '2',
                // cardNumber is already resolved from the header at index 0, so this is skipped (no duplicate).
                cardNumber: '2',
                // Out-of-range index is skipped.
                amount: '99',
                // Merchant is unresolved and index 1 is free, so it is filled here.
                merchant: '1',
            };

            const columns = getCompanyCardColumnMappings(spreadsheetData, savedColumnMappings, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
                1: CONST.CSV_IMPORT_COLUMNS.MERCHANT,
                2: CONST.CSV_IMPORT_COLUMNS.IGNORE,
            });
        });

        it('should leave every column as ignore when nothing matches and there is no saved layout', () => {
            const spreadsheetData = [
                ['Foo', 'x'],
                ['Bar', 'y'],
            ];

            const columns = getCompanyCardColumnMappings(spreadsheetData, undefined, availableRoles);

            expect(columns).toEqual({
                0: CONST.CSV_IMPORT_COLUMNS.IGNORE,
                1: CONST.CSV_IMPORT_COLUMNS.IGNORE,
            });
        });
    });

    describe('importTransactionsFromCSV', () => {
        const CURRENT_USER_ACCOUNT_ID = 12345;
        const validSpreadsheet = createMock<ImportedSpreadsheet>({
            data: [
                ['Date', '2024-01-15', '2024-01-20'],
                ['Merchant', 'Coffee Shop', 'Restaurant'],
                ['Amount', '5.50', '25.00'],
            ],
            columns: {
                0: 'date',
                1: 'merchant',
                2: 'amount',
            },
            containsHeader: true,
        });

        it('returns the failed-import modal and skips the API call when no transactions are parsed', async () => {
            const result = await importTransactionsFromCSV({...validSpreadsheet, data: []}, CURRENT_USER_ACCOUNT_ID);

            expect(result).toEqual({titleKey: 'spreadsheet.importFailedTitle', promptKey: 'spreadsheet.invalidFileMessage'});
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('calls API.write with an optimistic card when no existingCardID is passed', async () => {
            await importTransactionsFromCSV(validSpreadsheet, CURRENT_USER_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalledTimes(1);
            const [command, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(command).toBe('ImportCSVTransactions');
            getRequiredOnyxUpdate(onyxData, 'optimisticData', ONYXKEYS.CARD_LIST, Onyx.METHOD.MERGE);
        });

        it('sends the tag of each row and sets it on the optimistic transaction', async () => {
            // Given a spreadsheet with a column mapped to Tag
            const spreadsheetWithTag = createMock<ImportedSpreadsheet>({
                data: [
                    ['Date', '2024-01-15'],
                    ['Merchant', 'Coffee Shop'],
                    ['Amount', '5.50'],
                    ['Tag', 'Visa'],
                ],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                    3: 'tag',
                },
                containsHeader: true,
            });

            // When the transactions are imported
            await importTransactionsFromCSV(spreadsheetWithTag, CURRENT_USER_ACCOUNT_ID);

            // Then the tag is sent to the server and shown on the expense right away
            const [, params, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(JSON.parse(String(params.transactionList))).toEqual([expect.objectContaining({tag: 'Visa'})]);
            const optimisticData = getRequiredOnyxUpdates(onyxData, 'optimisticData');
            expect(optimisticData).toEqual(expect.arrayContaining([expect.objectContaining({value: expect.objectContaining({merchant: 'Coffee Shop', tag: 'Visa'})})]));
        });

        it('stores the reimbursable selection on the optimistic card', async () => {
            const nonReimbursableSpreadsheet = {...validSpreadsheet, importTransactionSettings: {isReimbursable: false}};

            await importTransactionsFromCSV(nonReimbursableSpreadsheet, CURRENT_USER_ACCOUNT_ID);

            const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            const cardUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', ONYXKEYS.CARD_LIST, Onyx.METHOD.MERGE, true);
            const [optimisticCard] = Object.values(cardUpdate.value);
            expect(optimisticCard).toEqual(expect.objectContaining({reimbursable: false}));
        });

        it('reuses an existingCardID without queuing an optimistic card', async () => {
            const existingCardID = 987654321;

            await importTransactionsFromCSV(validSpreadsheet, CURRENT_USER_ACCOUNT_ID, existingCardID);

            const [, params, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardID).toBe(existingCardID);
            const optimisticData = getRequiredOnyxUpdates(onyxData, 'optimisticData');
            expect(optimisticData).not.toEqual(expect.arrayContaining([expect.objectContaining({key: ONYXKEYS.CARD_LIST})]));
        });

        it('uses the hard defaults when importing a new card that has no saved layout', async () => {
            await importTransactionsFromCSV(validSpreadsheet, CURRENT_USER_ACCOUNT_ID);

            const [, params] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardName).toBe('Imported Card');
            expect(params.currency).toBe(CONST.CURRENCY.USD);
            expect(params.reimbursable).toBe(true);
            expect(JSON.parse(String(params.columnMappings))).toEqual(expect.objectContaining({flipAmountSign: false}));
            expect(JSON.parse(String(params.transactionList))).toEqual([expect.objectContaining({amount: 550}), expect.objectContaining({amount: 2500})]);
        });

        it('sends the existing card settings instead of the defaults when re-uploading to a card', async () => {
            const existingCardID = 987654321;
            const existingCardSettings = {cardDisplayName: 'Aussie Card', currency: 'AUD', isReimbursable: false, flipAmountSign: true};

            await importTransactionsFromCSV(validSpreadsheet, CURRENT_USER_ACCOUNT_ID, existingCardID, undefined, existingCardSettings);

            const [, params] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardName).toBe('Aussie Card');
            expect(params.currency).toBe('AUD');
            expect(params.reimbursable).toBe(false);
            expect(params.columnMappings).toBe(JSON.stringify(buildColumnLayout(validSpreadsheet, 'Aussie Card', 'AUD', false, true)));
        });
    });

    describe('uploadOFXStatement', () => {
        const CURRENT_USER_ACCOUNT_ID = 12345;
        const statement = {name: 'statement.ofx', type: 'application/x-ofx', uri: 'file:///statement.ofx'};

        it('sends the file itself so the backend parses it', async () => {
            await uploadOFXStatement(statement, {}, CURRENT_USER_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalledTimes(1);
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(command).toBe('UploadOFX');
            expect(params.file).toBe(statement);
        });

        it('queues an optimistic card when no existingCardID is passed', async () => {
            await uploadOFXStatement(statement, {cardDisplayName: 'Citi Personal', isReimbursable: false}, CURRENT_USER_ACCOUNT_ID);

            const [, params, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardName).toBe('Citi Personal');
            expect(params.reimbursable).toBe(false);
            const cardUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', ONYXKEYS.CARD_LIST, Onyx.METHOD.MERGE, true);
            const [optimisticCard] = Object.values(cardUpdate.value);
            expect(optimisticCard).toEqual(expect.objectContaining({reimbursable: false}));
            expect(Object.keys(cardUpdate.value).at(0)).toBe(String(params.cardID));
        });

        it('reuses an existingCardID without queuing an optimistic card', async () => {
            const existingCardID = 987654321;

            await uploadOFXStatement(statement, {}, CURRENT_USER_ACCOUNT_ID, existingCardID);

            const [, params, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardID).toBe(existingCardID);
            const optimisticData = getRequiredOnyxUpdates(onyxData, 'optimisticData');
            expect(optimisticData).not.toEqual(expect.arrayContaining([expect.objectContaining({key: ONYXKEYS.CARD_LIST})]));
        });

        it('falls back to the same default name the spreadsheet import uses', async () => {
            await uploadOFXStatement(statement, {}, CURRENT_USER_ACCOUNT_ID);

            const [, params] = getRequiredWriteCall(writeSpy.mock.calls, 0);
            expect(params.cardName).toBe(CONST.DEFAULT_IMPORTED_CARD_NAME);
            expect(params.reimbursable).toBe(true);
        });

        it('returns the failed-import modal when the request throws', async () => {
            const result = await uploadOFXStatement(statement, {}, CURRENT_USER_ACCOUNT_ID);

            expect(result).toEqual({titleKey: 'spreadsheet.importFailedTitle', promptKey: 'spreadsheet.importFailedDescription'});
        });
    });

    describe('getExistingCardImportSettings', () => {
        const savedLayout = createMock<SavedCSVColumnLayoutData>({
            name: 'Layout Card',
            flipAmountSign: true,
            reimbursable: false,
            accountDetails: {
                bank: CONST.PERSONAL_CARDS.BANK_NAME.CSV,
                currency: 'AUD',
                accountID: 'Layout Card',
            },
        });

        it('returns the currency and amount sign from the saved layout', () => {
            const result = getExistingCardImportSettings(undefined, savedLayout, undefined);

            expect(result).toEqual({cardDisplayName: 'Layout Card', currency: 'AUD', isReimbursable: false, flipAmountSign: true});
        });

        it('prefers the card values over the saved layout ones', () => {
            const card = createMock<Card>({cardName: 'Backend Card', reimbursable: true, nameValuePairs: {cardTitle: 'Card Title'}});

            const result = getExistingCardImportSettings(card, savedLayout, undefined);

            expect(result).toEqual({cardDisplayName: 'Card Title', currency: 'AUD', isReimbursable: true, flipAmountSign: true});
        });

        it('prefers the custom card name over every other name', () => {
            const card = createMock<Card>({cardName: 'Backend Card', nameValuePairs: {cardTitle: 'Card Title'}});

            const result = getExistingCardImportSettings(card, savedLayout, 'Custom Name');

            expect(result.cardDisplayName).toBe('Custom Name');
        });

        it('returns no settings when there is nothing to restore', () => {
            expect(getExistingCardImportSettings(undefined, undefined, undefined)).toEqual({});
        });
    });
});
