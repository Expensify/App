import getPlatform from '@libs/getPlatform';
import {getHoldMenuAmounts, openAfterTouchFrame} from '@libs/HoldMenuUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'web'),
}));

jest.mock('@libs/ReportUtils', () => ({
    getNonHeldAndFullAmount: jest.fn(),
    hasOnlyHeldExpenses: jest.fn(),
}));

const mockGetPlatform = jest.mocked(getPlatform);
const mockGetNonHeldAndFullAmount = jest.mocked(getNonHeldAndFullAmount);
const mockHasOnlyHeldExpenses = jest.mocked(hasOnlyHeldExpenses);

const report = createRandomReport(1, undefined);
const transactions = [createRandomTransaction(1), createRandomTransaction(2), createRandomTransaction(3)];
const convertToDisplayString = jest.fn();

describe('HoldMenuUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
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

    describe('openAfterTouchFrame', () => {
        it('opens right away on platforms other than iOS', async () => {
            // Given a platform other than iOS
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const open = jest.fn(() => 'opened');

            // When the modal is opened
            const result = openAfterTouchFrame(open);

            // Then it opens synchronously and the promise resolves with the open result
            expect(open).toHaveBeenCalledTimes(1);
            await expect(result).resolves.toBe('opened');
        });

        it('waits one animation frame on iOS', async () => {
            // Given iOS, where the touch animation must finish before a modal opens
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
            let runFrame: FrameRequestCallback | undefined;
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                runFrame = callback;
                return 0;
            });
            const open = jest.fn(() => Promise.resolve('closed'));

            // When the modal is opened
            const result = openAfterTouchFrame(open);

            // Then it does not open until the next frame runs
            expect(open).not.toHaveBeenCalled();
            runFrame?.(0);
            expect(open).toHaveBeenCalledTimes(1);

            // And the promise follows the promise that open returns
            await expect(result).resolves.toBe('closed');
            requestAnimationFrameSpy.mockRestore();
        });
    });
});
