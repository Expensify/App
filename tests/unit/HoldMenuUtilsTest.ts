import {getHoldMenuAmounts} from '@libs/HoldMenuUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses} from '@libs/ReportUtils';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

jest.mock('@libs/ReportUtils', () => ({
    getNonHeldAndFullAmount: jest.fn(),
    hasOnlyHeldExpenses: jest.fn(),
}));

const mockGetNonHeldAndFullAmount = jest.mocked(getNonHeldAndFullAmount);
const mockHasOnlyHeldExpenses = jest.mocked(hasOnlyHeldExpenses);

const report = createRandomReport(1, undefined);
const transactions = [createRandomTransaction(1), createRandomTransaction(2), createRandomTransaction(3)];
const convertToDisplayString = jest.fn();

describe('HoldMenuUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getHoldMenuAmounts', () => {
        it('returns the non-held amount when the report has a valid non-held amount', () => {
            // Given a report where some expenses are not held and the non-held amount is valid
            mockHasOnlyHeldExpenses.mockReturnValue(false);
            mockGetNonHeldAndFullAmount.mockReturnValue({nonHeldAmount: '$10.00', fullAmount: '$30.00', hasValidNonHeldAmount: true});

            // When the hold menu amounts are built
            const amounts = getHoldMenuAmounts(report, true, transactions, convertToDisplayString);

            // Then the menu offers both amounts, so the user can pay only the non-held expenses
            expect(amounts).toEqual({nonHeldAmount: '$10.00', fullAmount: '$30.00', hasNonHeldExpenses: true, transactionCount: 3});
            expect(mockGetNonHeldAndFullAmount).toHaveBeenCalledWith(report, true, transactions, convertToDisplayString);
        });

        it('drops the non-held amount when every expense is held', () => {
            // Given a report where every expense is held
            mockHasOnlyHeldExpenses.mockReturnValue(true);
            mockGetNonHeldAndFullAmount.mockReturnValue({nonHeldAmount: '$0.00', fullAmount: '$30.00', hasValidNonHeldAmount: true});

            // When the hold menu amounts are built
            const amounts = getHoldMenuAmounts(report, true, transactions, convertToDisplayString);

            // Then there is no non-held amount to offer, so the menu only shows the full amount
            expect(amounts).toEqual({nonHeldAmount: undefined, fullAmount: '$30.00', hasNonHeldExpenses: false, transactionCount: 3});
        });

        it('drops the non-held amount when it is not valid', () => {
            // Given a report with non-held expenses whose non-held amount is not valid
            mockHasOnlyHeldExpenses.mockReturnValue(false);
            mockGetNonHeldAndFullAmount.mockReturnValue({nonHeldAmount: '$10.00', fullAmount: '$30.00', hasValidNonHeldAmount: false});

            // When the hold menu amounts are built
            const amounts = getHoldMenuAmounts(report, true, transactions, convertToDisplayString);

            // Then the invalid amount is not offered
            expect(amounts.nonHeldAmount).toBeUndefined();
            expect(amounts.hasNonHeldExpenses).toBe(true);
        });
    });
});
