import {groupTransactionsByCategory, groupTransactionsByTag} from '@libs/ReportLayoutUtils';
import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';

const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);

const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction =>
    ({
        transactionID: `transaction_${Math.random()}`,
        amount: -1000,
        currency: 'USD',
        category: '',
        tag: '',
        comment: {},
        ...overrides,
    }) as Transaction;

const createMockReport = (overrides: Partial<Report> = {}): Report =>
    ({
        reportID: '1',
        currency: 'USD',
        ...overrides,
    }) as Report;

describe('groupTransactionsByCategory', () => {
    it('returns empty array when report is undefined', () => {
        const transactions = [createMockTransaction({category: 'Travel'})];
        expect(groupTransactionsByCategory(transactions, undefined, mockLocaleCompare)).toEqual([]);
    });

    it('returns empty array when transactions array is empty', () => {
        const report = createMockReport();
        expect(groupTransactionsByCategory([], report, mockLocaleCompare)).toEqual([]);
    });

    it('groups transactions by category', () => {
        const report = createMockReport();
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000}),
            createMockTransaction({transactionID: '2', category: 'Meals', amount: -500}),
            createMockTransaction({transactionID: '3', category: 'Travel', amount: -2000}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(2);
        expect(result.find((g) => g.groupKey === 'Meals')?.transactions).toHaveLength(1);
        expect(result.find((g) => g.groupKey === 'Travel')?.transactions).toHaveLength(2);
    });

    it('puts transactions with empty category in a group with empty key', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', category: '', amount: -1000}), createMockTransaction({transactionID: '2', category: 'Travel', amount: -500})];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(2);
        expect(result.find((g) => g.groupKey === '')?.transactions).toHaveLength(1);
    });

    it('sorts groups alphabetically with empty key at the end', () => {
        const report = createMockReport();
        const transactions = [
            createMockTransaction({transactionID: '1', category: '', amount: -1000}),
            createMockTransaction({transactionID: '2', category: 'Zebra', amount: -500}),
            createMockTransaction({transactionID: '3', category: 'Alpha', amount: -200}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(3);
        expect(result.at(0)?.groupKey).toBe('Alpha');
        expect(result.at(1)?.groupKey).toBe('Zebra');
        expect(result.at(2)?.groupKey).toBe('');
    });

    it('sets isExpanded to true for all groups', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000}), createMockTransaction({transactionID: '2', category: 'Meals', amount: -500})];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result.every((g) => g.isExpanded === true)).toBe(true);
    });

    it('calculates subtotal using getAmount for same-currency transactions', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'USD'}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -2000, currency: 'USD'}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(3000);
    });

    it('uses convertedAmount for multi-currency transactions', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'EUR', convertedAmount: -1200}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(1700);
    });

    it('ignores foreign currency transactions without convertedAmount in total calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'EUR'}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(500);
    });

    it('uses modifiedCurrency to determine transaction currency when edited', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({
                transactionID: '1',
                category: 'Travel',
                amount: -1200,
                currency: 'USD',
                modifiedCurrency: 'AED',
                convertedAmount: -8,
            }),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(508);
    });

    it('sets groupName equal to groupKey', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000})];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result.at(0)?.groupName).toBe(result.at(0)?.groupKey);
        expect(result.at(0)?.groupName).toBe('Travel');
    });

    it('treats missing category as empty category group', () => {
        const report = createMockReport();
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'none', amount: -1000}),
            createMockTransaction({transactionID: '2', category: 'Uncategorized', amount: -500}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.groupKey).toBe('');
        expect(result.at(0)?.transactions).toHaveLength(2);
    });

    it('excludes pending delete transactions from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'USD'}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -1200, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(1000);
        expect(travelGroup?.transactions).toHaveLength(2);
    });

    it('returns zero subtotal when all transactions in group are pending delete', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -1200, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(0);
        expect(travelGroup?.transactions).toHaveLength(2);
    });

    it('excludes pending delete multi-currency transactions from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'EUR', convertedAmount: -1200}),
            createMockTransaction({transactionID: '2', category: 'Travel', amount: -500, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(1200);
        expect(travelGroup?.transactions).toHaveLength(2);
    });

    it('excludes pending delete transactions with modifiedCurrency from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', category: 'Travel', amount: -1000, currency: 'USD'}),
            createMockTransaction({
                transactionID: '2',
                category: 'Travel',
                amount: -1200,
                currency: 'USD',
                modifiedCurrency: 'AED',
                convertedAmount: -50,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }),
        ];

        const result = groupTransactionsByCategory(transactions, report, mockLocaleCompare);
        const travelGroup = result.find((g) => g.groupKey === 'Travel');

        expect(travelGroup?.subTotalAmount).toBe(1000);
        expect(travelGroup?.transactions).toHaveLength(2);
    });
});

describe('groupTransactionsByTag', () => {
    it('returns empty array when report is undefined', () => {
        const transactions = [createMockTransaction({tag: 'Project A'})];
        expect(groupTransactionsByTag(transactions, undefined, mockLocaleCompare)).toEqual([]);
    });

    it('returns empty array when transactions array is empty', () => {
        const report = createMockReport();
        expect(groupTransactionsByTag([], report, mockLocaleCompare)).toEqual([]);
    });

    it('groups transactions by tag', () => {
        const report = createMockReport();
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000}),
            createMockTransaction({transactionID: '2', tag: 'Project B', amount: -500}),
            createMockTransaction({transactionID: '3', tag: 'Project A', amount: -2000}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(2);
        expect(result.find((g) => g.groupKey === 'Project A')?.transactions).toHaveLength(2);
        expect(result.find((g) => g.groupKey === 'Project B')?.transactions).toHaveLength(1);
    });

    it('puts transactions with empty tag in a group with empty key', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', tag: '', amount: -1000}), createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500})];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(2);
        expect(result.find((g) => g.groupKey === '')?.transactions).toHaveLength(1);
    });

    it('sorts groups alphabetically with empty key at the end', () => {
        const report = createMockReport();
        const transactions = [
            createMockTransaction({transactionID: '1', tag: '', amount: -1000}),
            createMockTransaction({transactionID: '2', tag: 'Zebra', amount: -500}),
            createMockTransaction({transactionID: '3', tag: 'Alpha', amount: -200}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(3);
        expect(result.at(0)?.groupKey).toBe('Alpha');
        expect(result.at(1)?.groupKey).toBe('Zebra');
        expect(result.at(2)?.groupKey).toBe('');
    });

    it('sets isExpanded to true for all groups', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000}), createMockTransaction({transactionID: '2', tag: 'Project B', amount: -500})];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result.every((g) => g.isExpanded === true)).toBe(true);
    });

    it('calculates subtotal using getAmount for same-currency transactions', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'USD'}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -2000, currency: 'USD'}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(3000);
    });

    it('uses convertedAmount for multi-currency transactions', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'EUR', convertedAmount: -1200}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(1700);
    });

    it('ignores foreign currency transactions without convertedAmount in total calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'EUR'}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(500);
    });

    it('uses modifiedCurrency to determine transaction currency when edited', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({
                transactionID: '1',
                tag: 'Project A',
                amount: -1200,
                currency: 'USD',
                modifiedCurrency: 'AED',
                convertedAmount: -8,
            }),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500, currency: 'USD'}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(508);
    });

    it('sets groupName equal to groupKey', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000})];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result.at(0)?.groupName).toBe(result.at(0)?.groupKey);
        expect(result.at(0)?.groupName).toBe('Project A');
    });

    it('treats TAG_EMPTY_VALUE (none) as empty tag group', () => {
        const report = createMockReport();
        const transactions = [createMockTransaction({transactionID: '1', tag: 'none', amount: -1000}), createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500})];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);

        expect(result).toHaveLength(2);
        expect(result.find((g) => g.groupKey === '')?.transactions).toHaveLength(1);
    });

    it('excludes pending delete transactions from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'USD'}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -1200, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(1000);
        expect(projectAGroup?.transactions).toHaveLength(2);
    });

    it('returns zero subtotal when all transactions in group are pending delete', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -1200, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(0);
        expect(projectAGroup?.transactions).toHaveLength(2);
    });

    it('excludes pending delete multi-currency transactions from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'EUR', convertedAmount: -1200}),
            createMockTransaction({transactionID: '2', tag: 'Project A', amount: -500, currency: 'USD', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(1200);
        expect(projectAGroup?.transactions).toHaveLength(2);
    });

    it('excludes pending delete transactions with modifiedCurrency from subtotal calculation', () => {
        const report = createMockReport({currency: 'USD'});
        const transactions = [
            createMockTransaction({transactionID: '1', tag: 'Project A', amount: -1000, currency: 'USD'}),
            createMockTransaction({
                transactionID: '2',
                tag: 'Project A',
                amount: -1200,
                currency: 'USD',
                modifiedCurrency: 'AED',
                convertedAmount: -50,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }),
        ];

        const result = groupTransactionsByTag(transactions, report, mockLocaleCompare);
        const projectAGroup = result.find((g) => g.groupKey === 'Project A');

        expect(projectAGroup?.subTotalAmount).toBe(1000);
        expect(projectAGroup?.transactions).toHaveLength(2);
    });
});
