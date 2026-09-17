import {isApprovalLimitChanged, parseApprovalLimit} from '@libs/PolicyMemberUtils';

describe('PolicyMemberUtils', () => {
    describe('parseApprovalLimit', () => {
        it('converts a dollar amount to the currency minor unit', () => {
            expect(parseApprovalLimit('500', 2)).toBe('50000');
            expect(parseApprovalLimit('500.25', 2)).toBe('50025');
        });

        it('accepts currency formatting', () => {
            expect(parseApprovalLimit('$1,500.50', 2)).toBe('150050');
        });

        it('supports currency-specific decimal precision', () => {
            expect(parseApprovalLimit('500', 0)).toBe('500');
            expect(parseApprovalLimit('500.125', 3)).toBe('500125');
        });

        it('preserves blank values and rejects invalid values', () => {
            expect(parseApprovalLimit('', 2)).toBe('');
            expect(parseApprovalLimit('not an amount', 2)).toBeNull();
            expect(parseApprovalLimit('-500', 2)).toBeNull();
            expect(parseApprovalLimit('500.123', 2)).toBeNull();
        });
    });

    describe('isApprovalLimitChanged', () => {
        it('compares imported and existing values in minor units', () => {
            expect(isApprovalLimitChanged('50000', 50000)).toBe(false);
            expect(isApprovalLimitChanged('50000', 500)).toBe(true);
            expect(isApprovalLimitChanged('50000', undefined)).toBe(true);
        });

        it('preserves blank-value comparison behavior', () => {
            expect(isApprovalLimitChanged('', undefined)).toBe(false);
            expect(isApprovalLimitChanged('', 50000)).toBe(true);
        });
    });
});
