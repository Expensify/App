/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import {applySavedColumnMappings} from '@libs/actions/ImportSpreadsheet';
import {buildColumnLayout, buildTransactionListFromSpreadsheet, getColumnIndexes} from '@libs/actions/ImportTransactions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {SavedCSVColumnLayoutData} from '@src/types/onyx/SavedCSVColumnLayout';

describe('ImportTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on Onyx.merge for tests that need to verify it was called
        jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
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
            });
        });

        it('should return all -1 when columns is empty', () => {
            const result = getColumnIndexes({});
            expect(result).toEqual({
                date: -1,
                merchant: -1,
                amount: -1,
                category: -1,
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
            });
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
            });
        });
    });

    describe('buildColumnLayout', () => {
        it('should build a basic layout with no column mappings', () => {
            const spreadsheet = {
                data: [],
                columns: {},
                containsHeader: true,
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

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
                        type: false,
                    },
                    indexes: {
                        date: false,
                        amount: false,
                        merchant: false,
                        category: false,
                        type: false,
                    },
                },
            });
        });

        it('should build layout with column mappings and extract header names', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

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
                type: false,
            });
            expect(result.columnMapping.names).toEqual({
                date: 'Date',
                merchant: 'Merchant',
                amount: 'Amount',
                category: 'Category',
                type: false,
            });
        });

        it('should handle missing headers when containsHeader is false', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildColumnLayout(spreadsheet, 'Card', 'USD', true, false);

            expect(result.columnMapping.indexes).toEqual({
                date: 0,
                merchant: 1,
                amount: 2,
                category: false,
                type: false,
            });
            // Names should be false when no header
            expect(result.columnMapping.names).toEqual({
                date: false,
                merchant: false,
                amount: false,
                category: false,
                type: false,
            });
        });

        it('should handle out of bounds column indexes gracefully', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

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
            const spreadsheet = {
                data: [],
                columns: {
                    0: 'date',
                    1: 'merchant',
                    2: 'amount',
                },
                containsHeader: true,
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toEqual([]);
        });

        it('should build transactions from valid spreadsheet data', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

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
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.category).toBe('Office Supplies');
        });

        it('should skip rows with missing required fields (date or amount)', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            // Should only have 1 transaction (row 1), skipping rows 2 (no date) and 3 (no amount)
            expect(result).toHaveLength(1);
            expect(result.at(0)?.merchant).toBe('Store A');
        });

        it('should flip amount sign when flipAmountSign is true', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {flipAmountSign: true});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.amount).toBe(-1000); // Flipped
        });

        it('should handle amounts with currency symbols and commas', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)?.amount).toBe(123456); // $1,234.56 in cents
            expect(result.at(1)?.amount).toBe(99999); // €999.99 in cents
        });

        it('should handle negative amounts', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(1);
            expect(result.at(0)?.amount).toBe(-5000);
        });

        it('should work with containsHeader false', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)).toMatchObject({
                created: '2024-01-15',
                merchant: 'Store A',
                amount: 1000,
            });
        });

        it('should handle various date formats', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(4);
            expect(result.at(0)?.created).toBe('2024-01-15');
            expect(result.at(1)?.created).toBe('2024-01-20');
            expect(result.at(2)?.created).toBe('2024-01-20');
            expect(result.at(3)?.created).toBe('2024-01-25');
        });

        it('should skip rows with invalid dates', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

            const result = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(result).toHaveLength(2);
            expect(result.at(0)?.merchant).toBe('Store A');
            expect(result.at(1)?.merchant).toBe('Store C');
        });

        it('should handle missing merchant gracefully', () => {
            const spreadsheet = {
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
            } as Partial<ImportedSpreadsheet> as ImportedSpreadsheet;

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
            const savedLayout = {
                name: 'Test',
                columnMapping: {},
            } as SavedCSVColumnLayoutData;

            applySavedColumnMappings(spreadsheetData, savedLayout);

            expect(Onyx.merge).not.toHaveBeenCalled();
        });

        it('should not apply mappings when names is missing', () => {
            const spreadsheetData = [
                ['Date', '2024-01-01'],
                ['Merchant', 'Store'],
            ];
            const savedLayout = {
                name: 'Test',
                columnMapping: {
                    indexes: {},
                },
            } as SavedCSVColumnLayoutData;

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
});
