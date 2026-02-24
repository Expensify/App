import {convertToDisplayString} from '@libs/CurrencyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {getAmount, getCurrency, getDescription, getMerchant} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

// Mock the dependencies
jest.mock('@libs/CurrencyUtils');
jest.mock('@libs/TransactionUtils');

const mockConvertToDisplayString = convertToDisplayString as jest.MockedFunction<typeof convertToDisplayString>;
const mockGetMerchant = getMerchant as jest.MockedFunction<typeof getMerchant>;
const mockGetDescription = getDescription as jest.MockedFunction<typeof getDescription>;
const mockGetAmount = getAmount as jest.MockedFunction<typeof getAmount>;
const mockGetCurrency = getCurrency as jest.MockedFunction<typeof getCurrency>;

describe('AddUnreportedExpense Search Functionality', () => {
    const mockTransaction1: Partial<Transaction> = {
        transactionID: '1',
        merchant: 'Starbucks',
        comment: {comment: 'Coffee meeting'},
        amount: 500, // $5.00
        currency: 'USD',
    };

    const mockTransaction2: Partial<Transaction> = {
        transactionID: '2',
        merchant: 'Uber',
        comment: {comment: 'Taxi to airport'},
        amount: 2500, // $25.00
        currency: 'USD',
    };

    const mockTransaction3: Partial<Transaction> = {
        transactionID: '3',
        merchant: 'Hotel California',
        comment: {comment: 'Business trip accommodation'},
        amount: 15000, // $150.00
        currency: 'USD',
    };

    const transactions = [mockTransaction1, mockTransaction2, mockTransaction3] as Transaction[];

    beforeEach(() => {
        // Setup mocks
        mockGetMerchant.mockImplementation((transaction) => {
            if (transaction?.transactionID === '1') {
                return 'Starbucks';
            }
            if (transaction?.transactionID === '2') {
                return 'Uber';
            }
            if (transaction?.transactionID === '3') {
                return 'Hotel California';
            }
            return '';
        });

        mockGetDescription.mockImplementation((transaction) => {
            if (transaction?.transactionID === '1') {
                return 'Coffee meeting';
            }
            if (transaction?.transactionID === '2') {
                return 'Taxi to airport';
            }
            if (transaction?.transactionID === '3') {
                return 'Business trip accommodation';
            }
            return '';
        });

        mockGetAmount.mockImplementation((transaction) => {
            if (transaction?.transactionID === '1') {
                return 500;
            }
            if (transaction?.transactionID === '2') {
                return 2500;
            }
            if (transaction?.transactionID === '3') {
                return 15000;
            }
            return 0;
        });

        mockGetCurrency.mockImplementation(() => 'USD');

        mockConvertToDisplayString.mockImplementation((amount) => {
            if (amount === 500) {
                return '$5.00';
            }
            if (amount === 2500) {
                return '$25.00';
            }
            if (amount === 15000) {
                return '$150.00';
            }
            return '$0.00';
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const getSearchableFields = (transaction: Transaction) => {
        const searchableFields: string[] = [];

        // Add merchant to searchable fields
        const merchant = getMerchant(transaction);
        if (merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT) {
            searchableFields.push(merchant);
        }

        // Add description to searchable fields
        const description = getDescription(transaction);
        if (description.trim()) {
            searchableFields.push(description);
        }

        // Add formatted amount to searchable fields
        const amount = getAmount(transaction);
        const currency = getCurrency(transaction);
        const formattedAmount = convertToDisplayString(amount, currency);
        searchableFields.push(formattedAmount);

        // This allows users to search "2000" and find "$2,000.00" for example
        const normalizedAmount = (amount / 100).toString();
        searchableFields.push(normalizedAmount);

        return searchableFields;
    };

    it('should search by merchant name', () => {
        const searchTerm = 'Starbucks';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('1');
    });

    it('should search by description', () => {
        const searchTerm = 'Coffee meeting';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('1');
    });

    it('should search by amount', () => {
        const searchTerm = '$25.00';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('2');
    });

    it('should search by partial terms', () => {
        const searchTerm = 'Hotel';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('3');
    });

    it('should search across multiple fields', () => {
        const searchTerm = 'trip';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('3');
    });

    it('should return all transactions when search term is empty', () => {
        const searchTerm = '';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(3);
    });

    it('should return no results for non-matching search term', () => {
        const searchTerm = 'nonexistent';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(0);
    });

    it('should handle case-insensitive search', () => {
        const searchTerm = 'STARBUCKS';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('1');
    });

    it('should search by unformatted numeric amount', () => {
        const searchTerm = '25';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('2');
    });

    it('should search by unformatted numeric amount for large values', () => {
        const searchTerm = '150';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('3');
    });

    it('should search by formatted amount with comma', () => {
        const searchTerm = '$25.00';
        const result = tokenizedSearch(transactions, searchTerm, getSearchableFields);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.transactionID).toBe('2');
    });
});
