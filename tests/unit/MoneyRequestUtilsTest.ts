import {isValidPerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import {
    getAmountHasUnsavedChanges,
    getStringFieldHasUnsavedChanges,
    getWaypointsHasUnsavedChanges,
    handleNegativeAmountFlipping,
    hasMoneyRequestDraftUserEdits,
    haveMoneyRequestDraftsUserEdits,
    isConfirmationAmountMissing,
    isConfirmationDateMissing,
    isValidMerchant,
    isValidMoneyRequestAmount,
    validateAmount,
    validatePercentage,
} from '@libs/MoneyRequestUtils';

import CONST from '@src/CONST';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

describe('ReportActionsUtils', () => {
    describe('validateAmount', () => {
        it('should pass the validation when amount is within the max digit and decimal', () => {
            expect(validateAmount('1234567890', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890', 0, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890.12', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('123456789.1', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234567890.123', 3, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(true);
            expect(validateAmount('1234.1234', 4, 4)).toBe(true);
        });

        it("shouldn't pass the validation when amount is bigger than the max digit and decimal", () => {
            expect(validateAmount('1234567890.123', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('1234567890.1', 0, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('12345678901.12', 2, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('12345678901.1234', 3, CONST.IOU.AMOUNT_MAX_LENGTH)).toBe(false);
            expect(validateAmount('1234.12345', 4, 4)).toBe(false);
        });
    });

    describe('validatePercentage', () => {
        it('defaults to allowing whole numbers between 0 and 100', () => {
            expect(validatePercentage('')).toBe(true);
            expect(validatePercentage('0')).toBe(true);
            expect(validatePercentage('10')).toBe(true);
            expect(validatePercentage('99')).toBe(true);
            expect(validatePercentage('100')).toBe(true);

            expect(validatePercentage('150')).toBe(false);
            expect(validatePercentage('101')).toBe(false);
        });

        it('allows digit-only values above 100 when allowExceedingHundred is true', () => {
            expect(validatePercentage('', true)).toBe(true);
            expect(validatePercentage('0', true)).toBe(true);
            expect(validatePercentage('100', true)).toBe(true);
            expect(validatePercentage('150', true)).toBe(true);
        });

        it('rejects non-numeric characters even when allowExceedingHundred is true', () => {
            expect(validatePercentage('1.5', true)).toBe(false);
            expect(validatePercentage('abc', true)).toBe(false);
            expect(validatePercentage('10%', true)).toBe(false);
            expect(validatePercentage('-10', true)).toBe(false);
        });

        it('allows one decimal place when allowDecimal is true', () => {
            // Valid decimal percentages
            expect(validatePercentage('7.5', false, true)).toBe(true);
            expect(validatePercentage('0.1', false, true)).toBe(true);
            expect(validatePercentage('99.9', false, true)).toBe(true);
            expect(validatePercentage('100.0', false, true)).toBe(true);
            expect(validatePercentage('50', false, true)).toBe(true);
            expect(validatePercentage('', false, true)).toBe(true);

            // Invalid: more than one decimal place
            expect(validatePercentage('7.55', false, true)).toBe(false);
            expect(validatePercentage('100.01', false, true)).toBe(false);

            // Invalid: over 100
            expect(validatePercentage('100.1', false, true)).toBe(false);
            expect(validatePercentage('150', false, true)).toBe(false);
        });

        it('allows decimals and exceeding 100 when both flags are true', () => {
            expect(validatePercentage('150.5', true, true)).toBe(true);
            expect(validatePercentage('7.5', true, true)).toBe(true);
            expect(validatePercentage('200', true, true)).toBe(true);
            expect(validatePercentage('.5', true, true)).toBe(true);

            // Invalid: more than one decimal place
            expect(validatePercentage('7.55', true, true)).toBe(false);
            expect(validatePercentage('abc', true, true)).toBe(false);
        });

        it('accepts comma as decimal separator for locale support (e.g., Spanish)', () => {
            // With allowDecimal=true and comma separator
            expect(validatePercentage('7,5', false, true)).toBe(true);
            expect(validatePercentage('0,1', false, true)).toBe(true);
            expect(validatePercentage('99,9', false, true)).toBe(true);
            expect(validatePercentage('100,0', false, true)).toBe(true);

            // With allowExceedingHundred=true and allowDecimal=true
            expect(validatePercentage('150,5', true, true)).toBe(true);
            expect(validatePercentage('7,5', true, true)).toBe(true);
            expect(validatePercentage(',5', true, true)).toBe(true);

            // Invalid: more than one decimal place with comma
            expect(validatePercentage('7,55', true, true)).toBe(false);
            expect(validatePercentage('100,01', false, true)).toBe(false);

            // Invalid: mixed comma and period (should not accept both)
            expect(validatePercentage('7,5.5', true, true)).toBe(false);
            expect(validatePercentage('7.5,5', true, true)).toBe(false);
            expect(validatePercentage('1,234.56', true, true)).toBe(false);
            expect(validatePercentage('1.234,56', true, true)).toBe(false);
            expect(validatePercentage('10,5.0', false, true)).toBe(false);
        });
    });

    describe('handleNegativeAmountFlipping', () => {
        it('should toggle negative and remove dash when allowFlippingAmount is true and amount starts with -', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-123.45', true, mockToggleNegative);

            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('123.45');
        });

        it('should not toggle negative when allowFlippingAmount is false', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-123.45', false, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('-123.45');
        });

        it('should not toggle negative when amount does not start with -', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('123.45', true, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should not strip minus sign without toggleNegative function', () => {
            const result = handleNegativeAmountFlipping('-123.45', true);

            expect(result).toBe('-123.45');
        });

        it('should return original amount when allowFlippingAmount is false and no dash', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('123.45', false, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('123.45');
        });

        it('should handle empty string', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('', true, mockToggleNegative);

            expect(mockToggleNegative).not.toHaveBeenCalled();
            expect(result).toBe('');
        });

        it('should handle string with only dash', () => {
            const mockToggleNegative = jest.fn();
            const result = handleNegativeAmountFlipping('-', true, mockToggleNegative);

            expect(mockToggleNegative).toHaveBeenCalledTimes(1);
            expect(result).toBe('');
        });
    });

    describe('isValidPerDiemExpenseAmount', () => {
        it('should return true when per diem amount is within AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 2, rate: 1500}, // 2 * $15.00 = $30.00
                ],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(true);
        });

        it('should return false when when per diem amount exceeds AMOUNT_MAX_LENGTH', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: 'rate1', name: 'Breakfast', quantity: 100000, rate: 12345678}, // 100000 * $123,456.78 = $12,345,678,000.00
                ],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(false);
        });

        it('should return true when per diem expense has negative rate', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [{id: 'rate1', name: 'Breakfast', quantity: 1, rate: -1500}],
            };

            expect(isValidPerDiemExpenseAmount(customUnit, 2)).toBe(true);
        });
    });

    describe('isValidMoneyRequestAmount', () => {
        describe('invalid inputs', () => {
            it('should return false for nullish and NaN values', () => {
                expect(isValidMoneyRequestAmount(undefined, CONST.IOU.TYPE.SUBMIT)).toBe(false);
                // @ts-expect-error -- Deliberately verifies the defensive runtime behavior for null input.
                expect(isValidMoneyRequestAmount(null, CONST.IOU.TYPE.SUBMIT)).toBe(false);
                expect(isValidMoneyRequestAmount(NaN, CONST.IOU.TYPE.SUBMIT)).toBe(false);
            });
        });

        describe('negative amounts', () => {
            it('should respect the allowNegative flag', () => {
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, false)).toBe(false);
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, true)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.SUBMIT, false)).toBe(true);
            });
        });

        describe('P2P (peer-to-peer) transactions', () => {
            const allowNegative = true;
            const isP2P = true;

            it('should return false for zero or sub-cent amounts', () => {
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(false);
            });

            it('should return true for amounts >= 1 cent', () => {
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
            });
        });

        describe('non-zero IOU types (PAY, INVOICE, SPLIT)', () => {
            it('should return false for zero amount', () => {
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.PAY)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.INVOICE)).toBe(false);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return true for amounts >= 1 cent', () => {
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.PAY)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.INVOICE)).toBe(true);
                expect(isValidMoneyRequestAmount(1, CONST.IOU.TYPE.SPLIT)).toBe(true);
            });
        });

        describe('SUBMIT and REQUEST types (non-P2P)', () => {
            it('should allow zero, positive, and negative amounts', () => {
                const allowNegative = true;
                const isP2P = false;
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(-100, CONST.IOU.TYPE.SUBMIT, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(0, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
                expect(isValidMoneyRequestAmount(100, CONST.IOU.TYPE.REQUEST, allowNegative, isP2P)).toBe(true);
            });
        });
    });

    describe('isValidMerchant', () => {
        const iouReport = {
            reportID: '1',
            type: CONST.REPORT.TYPE.IOU,
        } as Report;

        const expenseReport = {
            reportID: '123',
            type: CONST.REPORT.TYPE.EXPENSE,
        } as Report;

        const unreportedTransaction = createMock<Transaction>({
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: 0,
        });

        const reportedTransaction = createMock<Transaction>({
            reportID: '123',
            amount: 0,
        });

        describe('empty merchants', () => {
            it('should return true for empty/undefined merchant when transaction is unreported or IOU', () => {
                expect(isValidMerchant('', unreportedTransaction)).toBe(true);
                expect(isValidMerchant('   ', unreportedTransaction)).toBe(true);
                expect(isValidMerchant(undefined, unreportedTransaction)).toBe(true);

                expect(isValidMerchant('', reportedTransaction, iouReport)).toBe(true);
                expect(isValidMerchant('   ', reportedTransaction, iouReport)).toBe(true);
                expect(isValidMerchant(undefined, reportedTransaction, iouReport)).toBe(true);
            });

            it('should return true for empty/undefined merchant when the report is missing, matching the normal edit flow', () => {
                expect(isValidMerchant('', reportedTransaction)).toBe(true);
                expect(isValidMerchant('')).toBe(true);
            });

            it('should return false for empty/undefined merchant on an expense report', () => {
                expect(isValidMerchant('', reportedTransaction, expenseReport)).toBe(false);
                expect(isValidMerchant('   ', reportedTransaction, expenseReport)).toBe(false);
                expect(isValidMerchant(undefined, reportedTransaction, expenseReport)).toBe(false);
            });
        });

        describe('invalid merchant constants', () => {
            it('should return false for invalid merchant constants regardless of transaction', () => {
                expect(isValidMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)).toBe(false);
                expect(isValidMerchant(CONST.TRANSACTION.DEFAULT_MERCHANT)).toBe(false);
                expect(isValidMerchant(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, unreportedTransaction)).toBe(false);
            });
        });

        describe('byte length validation', () => {
            it('should respect the 255 byte limit', () => {
                expect(isValidMerchant('Valid Merchant Name')).toBe(true);
                expect(isValidMerchant('a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES))).toBe(true);
                expect(isValidMerchant('a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES + 1))).toBe(false);
            });
        });

        it('should trim whitespace before validation', () => {
            expect(isValidMerchant('  Valid Merchant  ')).toBe(true);
        });
    });
});

describe('getAmountHasUnsavedChanges', () => {
    const sameCurrency = {selectedCurrency: 'USD', originalCurrency: 'USD'};

    it('flags a changed sign when the amount is empty', () => {
        expect(
            getAmountHasUnsavedChanges({
                ...sameCurrency,
                typedAmount: '',
                committedAmount: 0,
                isCreateEntry: true,
                isSignChanged: true,
            }),
        ).toBe(true);
    });

    it('does not flag an empty amount when the sign matches its initial value', () => {
        expect(
            getAmountHasUnsavedChanges({
                ...sameCurrency,
                typedAmount: '',
                committedAmount: 0,
                isCreateEntry: true,
                isSignChanged: false,
            }),
        ).toBe(false);
    });

    describe('create entry (any input counts)', () => {
        it('flags a typed value', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '1',
                    committedAmount: 100,
                    isCreateEntry: true,
                }),
            ).toBe(true);
        });

        it('flags an explicit "0" even though it normalizes to the empty backend value', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '0',
                    committedAmount: 100,
                    isCreateEntry: true,
                }),
            ).toBe(true);
        });

        it('does not flag an empty field', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '',
                    committedAmount: 0,
                    isCreateEntry: true,
                }),
            ).toBe(false);
        });

        it('flags a cleared field when the draft already holds an amount (revisited after Next)', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '',
                    committedAmount: 100,
                    isCreateEntry: true,
                }),
            ).toBe(true);
        });

        it('flags a currency change even with no amount entered', () => {
            expect(
                getAmountHasUnsavedChanges({
                    typedAmount: '',
                    committedAmount: 0,
                    isCreateEntry: true,
                    selectedCurrency: 'EUR',
                    originalCurrency: 'USD',
                }),
            ).toBe(true);
        });
    });

    describe('editing (only a real change counts)', () => {
        it('does not flag formatting-only differences like "5" vs "5.00"', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '5',
                    committedAmount: 500,
                    isCreateEntry: false,
                }),
            ).toBe(false);
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '5.00',
                    committedAmount: 500,
                    isCreateEntry: false,
                }),
            ).toBe(false);
        });

        it('flags a real numeric change', () => {
            expect(
                getAmountHasUnsavedChanges({
                    ...sameCurrency,
                    typedAmount: '6',
                    committedAmount: 500,
                    isCreateEntry: false,
                }),
            ).toBe(true);
        });

        it('flags a currency change even when the amount is unchanged', () => {
            expect(
                getAmountHasUnsavedChanges({
                    typedAmount: '5',
                    committedAmount: 500,
                    isCreateEntry: false,
                    selectedCurrency: 'EUR',
                    originalCurrency: 'USD',
                }),
            ).toBe(true);
        });
    });
});

describe('getStringFieldHasUnsavedChanges (hours, manual distance)', () => {
    describe('create entry (any input counts)', () => {
        it('flags any typed value, including "0"', () => {
            expect(getStringFieldHasUnsavedChanges('2', '', true)).toBe(true);
            expect(getStringFieldHasUnsavedChanges('0', '', true)).toBe(true);
        });

        it('does not flag an empty field', () => {
            expect(getStringFieldHasUnsavedChanges('', '', true)).toBe(false);
        });

        it('flags a cleared field when the draft already holds a value (revisited after Next)', () => {
            expect(getStringFieldHasUnsavedChanges('', '5', true)).toBe(true);
        });
    });

    describe('editing (only a change counts)', () => {
        it('flags only a change from the committed value', () => {
            expect(getStringFieldHasUnsavedChanges('2', '2', false)).toBe(false);
            expect(getStringFieldHasUnsavedChanges('3', '2', false)).toBe(true);
        });
    });
});

describe('getWaypointsHasUnsavedChanges (distance map)', () => {
    const waypointsA: WaypointCollection = {
        waypoint0: {address: 'Q Mall, Doha', lat: 25.3272762, lng: 51.4659325},
        waypoint1: {address: 'Qatar', lat: 25.354826, lng: 51.183884},
    };
    const waypointsB: WaypointCollection = {
        waypoint0: {address: 'Q Mall, Doha', lat: 25.3272762, lng: 51.4659325},
        waypoint1: {address: 'West Bay, Doha', lat: 25.2510416, lng: 51.4699357},
    };

    describe('create entry (any entered waypoint counts)', () => {
        it('flags a draft that has valid waypoints', () => {
            const transaction = createRandomTransaction(0);
            transaction.modifiedWaypoints = undefined;
            transaction.comment = {...transaction.comment, waypoints: waypointsA};
            expect(getWaypointsHasUnsavedChanges(transaction, undefined, waypointsA, true)).toBe(true);
        });

        it('does not flag an empty draft', () => {
            expect(getWaypointsHasUnsavedChanges(undefined, undefined, undefined, true)).toBe(false);
        });
    });

    // The edit branch ignores the transaction and compares the committed vs current waypoints directly.
    describe('editing (only a waypoint change counts)', () => {
        it('flags when a waypoint address changed from the committed one', () => {
            expect(getWaypointsHasUnsavedChanges(undefined, waypointsA, waypointsB, false)).toBe(true);
        });

        it('does not flag when the waypoints are unchanged', () => {
            expect(getWaypointsHasUnsavedChanges(undefined, waypointsA, waypointsA, false)).toBe(false);
        });

        it('does not flag when the committed baseline is missing', () => {
            expect(getWaypointsHasUnsavedChanges(undefined, undefined, waypointsA, false)).toBe(false);
        });
    });
});

describe('isConfirmationAmountMissing', () => {
    it('flags a manual expense whose amount the user has not entered yet', () => {
        expect(isConfirmationAmountMissing({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, isAmountSet: false})).toBe(true);
    });

    it('does not flag a manual expense once the amount is set', () => {
        expect(isConfirmationAmountMissing({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, isAmountSet: true})).toBe(false);
    });

    // `isAmountSet` is only ever set by the manual flow, so without the manual gate every scan expense would look
    // like it is missing its amount and show a phantom required error under a perfectly good value.
    it('does not flag a scan expense, whose amount is populated programmatically and never sets isAmountSet', () => {
        expect(isConfirmationAmountMissing({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, isAmountSet: undefined})).toBe(false);
    });

    it('does not flag a distance expense', () => {
        expect(isConfirmationAmountMissing({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE, isAmountSet: undefined})).toBe(false);
    });

    it('does not flag a missing transaction', () => {
        expect(isConfirmationAmountMissing(undefined)).toBe(false);
    });
});

describe('isConfirmationDateMissing', () => {
    const transactionWithoutDate = createMock<Transaction>({transactionID: '1', created: '', comment: {}});
    const transactionWithDate = createMock<Transaction>({transactionID: '1', created: '2026-07-29', comment: {}});

    it('flags an editable confirmation that renders the date field with the date cleared', () => {
        expect(isConfirmationDateMissing(transactionWithoutDate, true, false)).toBe(true);
    });

    it('does not flag it once the date is filled', () => {
        expect(isConfirmationDateMissing(transactionWithDate, true, false)).toBe(false);
    });

    // A date the user can't see can't be fixed inline, so it must never keep the shared required error alive.
    it('does not flag a confirmation that hides the date field', () => {
        expect(isConfirmationDateMissing(transactionWithoutDate, false, false)).toBe(false);
    });

    it('does not flag a read-only confirmation, where the date is populated server-side', () => {
        expect(isConfirmationDateMissing(transactionWithoutDate, true, true)).toBe(false);
    });
});

describe('hasMoneyRequestDraftUserEdits', () => {
    const PARTICIPANT_ACCOUNT_ID = 1;
    const buildDraft = (fields: Partial<Transaction>) =>
        createMock<Transaction>({transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, amount: 0, comment: {}, ...fields});

    it('treats a freshly seeded draft as clean', () => {
        // Given a manual draft with only the values the flow seeds on its own (default category, billable)
        const draft = buildDraft({category: 'Travel', billable: true, merchant: CONST.TRANSACTION.DEFAULT_MERCHANT});

        // When checking it for user edits
        // Then it's clean, so closing the flow doesn't prompt
        expect(hasMoneyRequestDraftUserEdits(draft)).toBe(false);
        expect(hasMoneyRequestDraftUserEdits(undefined)).toBe(false);
    });

    it.each([
        ['an entered amount', {isAmountSet: true}],
        ['an entered merchant', {isMerchantSet: true}],
        ['a picked date', {isCreatedSet: true}],
        ['a description', {comment: {comment: 'Team lunch'}}],
        ['a field without its own flag, such as a category', {hasUserEdits: true}],
        ['an attached receipt', {receipt: {source: 'blob:receipt'}}],
        ['an edited split share', {splitShares: {[PARTICIPANT_ACCOUNT_ID]: {amount: 100, isModified: true}}}],
    ])('treats %s as a user edit', (_, fields: Partial<Transaction>) => {
        // Given a manual or scan draft the user edited
        const draft = buildDraft(fields);

        // When checking it for user edits
        // Then it's dirty, because closing the flow would lose that input
        expect(hasMoneyRequestDraftUserEdits(draft)).toBe(true);
    });

    it('ignores a receipt the flow attached on its own', () => {
        // Given drafts holding a test receipt and a shared file the flow seeded
        const testReceiptDraft = buildDraft({receipt: {source: 'test-receipt', isTestReceipt: true}});
        const sharedFileDraft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, receipt: {source: 'file://shared.jpg'}});

        // When checking them for user edits
        // Then neither counts, since the user didn't attach them
        expect(hasMoneyRequestDraftUserEdits(testReceiptDraft)).toBe(false);
        expect(hasMoneyRequestDraftUserEdits(sharedFileDraft, {seededReceiptSource: 'file://shared.jpg'})).toBe(false);
        expect(hasMoneyRequestDraftUserEdits(sharedFileDraft, {seededReceiptSource: 'file://other.jpg'})).toBe(true);
    });

    it('ignores the amount and merchant a distance draft fills in on its own', () => {
        // Given a map distance draft whose amount and merchant were computed, but with no entered waypoint
        const draft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, isAmountSet: true, isMerchantSet: true});

        // When checking it for user edits
        // Then it's clean, since only the waypoints carry the user's input
        expect(hasMoneyRequestDraftUserEdits(draft)).toBe(false);

        // When the user enters the waypoints
        const draftWithWaypoint = buildDraft({
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            comment: {
                waypoints: {
                    waypoint0: {address: 'Q Mall, Doha', lat: 25.3272762, lng: 51.4659325},
                    waypoint1: {address: 'Qatar', lat: 25.354826, lng: 51.183884},
                },
            },
        });

        // Then it's dirty
        expect(hasMoneyRequestDraftUserEdits(draftWithWaypoint)).toBe(true);
    });

    it('detects input entered on the earlier steps of each request type', () => {
        // Given drafts where the user entered a manual distance, picked a per diem destination, and entered hours
        const manualDistanceDraft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, comment: {customUnit: {quantity: 12}}});
        const perDiemDraft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM, comment: {customUnit: {customUnitRateID: 'rate'}}});
        const timeDraft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.TIME, comment: {units: {count: 3}}});

        // When checking them for user edits
        // Then each one is dirty
        expect(hasMoneyRequestDraftUserEdits(manualDistanceDraft)).toBe(true);
        expect(hasMoneyRequestDraftUserEdits(perDiemDraft)).toBe(true);
        expect(hasMoneyRequestDraftUserEdits(timeDraft)).toBe(true);

        // When nothing was entered yet on those steps
        // Then they're clean
        expect(hasMoneyRequestDraftUserEdits(buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, comment: {customUnit: {quantity: null}}}))).toBe(false);
        expect(hasMoneyRequestDraftUserEdits(buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM}))).toBe(false);
        expect(hasMoneyRequestDraftUserEdits(buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.TIME}))).toBe(false);
    });

    it('treats a GPS draft as clean, since its trip survives the flow closing', () => {
        // Given a GPS distance draft with a computed amount
        const draft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_GPS, isAmountSet: true});

        // When checking it for user edits
        // Then it's clean
        expect(hasMoneyRequestDraftUserEdits(draft)).toBe(false);
    });

    it('treats odometer readings that match the draft saved for later as clean', () => {
        // Given an odometer draft holding readings
        const draft = buildDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, comment: {odometerStart: 10, odometerEnd: 20}});

        // When nothing was saved for later
        // Then the readings would be lost, so it's dirty
        expect(hasMoneyRequestDraftUserEdits(draft)).toBe(true);

        // When the same readings were saved for later
        // Then nothing is lost, so it's clean
        expect(hasMoneyRequestDraftUserEdits(draft, {savedOdometerDraft: {odometerStartReading: 10, odometerEndReading: 20}})).toBe(false);

        // When the user changed a reading after it was saved
        // Then it's dirty again
        expect(hasMoneyRequestDraftUserEdits(draft, {savedOdometerDraft: {odometerStartReading: 10, odometerEndReading: 25}})).toBe(true);
    });
});

describe('haveMoneyRequestDraftsUserEdits', () => {
    const SECOND_TRANSACTION_ID = '2';

    it('checks every draft, since multi-scan keeps one draft per receipt', () => {
        // Given a clean initial draft and a second draft holding a scanned receipt
        const drafts = {
            [`${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`]: createMock<Transaction>({
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                comment: {},
            }),
            [SECOND_TRANSACTION_ID]: createMock<Transaction>({
                transactionID: SECOND_TRANSACTION_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                comment: {},
                receipt: {source: 'blob:second'},
            }),
        };

        // When checking the flow's drafts for user edits
        // Then the scanned receipt makes the flow dirty
        expect(haveMoneyRequestDraftsUserEdits(drafts)).toBe(true);
        expect(haveMoneyRequestDraftsUserEdits(undefined)).toBe(false);
    });
});
