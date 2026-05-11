// SearchUtils.test.ts
import {getDefaultSearchTypeForRoute} from '@libs/SearchUtils';

describe('getDefaultSearchTypeForRoute', () => {
    it('should return expense for Expenses route', () => {
        expect(getDefaultSearchTypeForRoute('Expenses')).toBe('expense');
    });

    it('should return expense for ExpensesPage route', () => {
        expect(getDefaultSearchTypeForRoute('ExpensesPage')).toBe('expense');
    });

    it('should return expense-report for Reports route', () => {
        expect(getDefaultSearchTypeForRoute('Reports')).toBe('expense-report');
    });

    it('should return expense-report for ReportsPage route', () => {
        expect(getDefaultSearchTypeForRoute('ReportsPage')).toBe('expense-report');
    });

    it('should return expense as fallback for unknown routes', () => {
        expect(getDefaultSearchTypeForRoute('UnknownRoute')).toBe('expense');
        expect(getDefaultSearchTypeForRoute('')).toBe('expense');
    });

    it('should return expense as fallback for undefined', () => {
        expect(getDefaultSearchTypeForRoute(undefined as unknown as string)).toBe('expense');
    });
});