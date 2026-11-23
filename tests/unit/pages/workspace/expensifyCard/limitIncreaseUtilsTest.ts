import {canSubmitLimitIncreaseRequest, hasLimitRequestInProgress, isValidLimitIncreaseAmount, isValidTaxReturn} from '@pages/workspace/expensifyCard/limitIncreaseUtils';

describe('limit increase form', () => {
    test.each(['1', '1000.50', ' 25.00 '])('accepts a positive dollar amount: %s', (value) => {
        // Given a positive monetary amount with at most two decimal places
        // When the admin enters the amount in either monetary field
        // Then the form accepts it
        expect(isValidLimitIncreaseAmount(value)).toBe(true);
    });

    test.each(['', '0', '-1', '10.999', '1e6', 'abc', '1,000'])('rejects an invalid dollar amount: %s', (value) => {
        // Given an amount the backend cannot accept as a positive dollar value
        // When the admin enters it in the limit increase form
        // Then the form prevents submission
        expect(isValidLimitIncreaseAmount(value)).toBe(false);
    });

    test('only accepts a PDF of at most 5MB', () => {
        // Given a selected PDF at the upload size limit
        const pdf = {
            name: 'return.PDF',
            type: 'application/pdf',
            size: 5 * 1024 * 1024,
        };
        // When the admin selects it and a set of invalid alternatives
        // Then only the PDF at or below the size limit is valid
        expect(isValidTaxReturn(pdf)).toBe(true);
        expect(isValidTaxReturn({...pdf, size: pdf.size + 1})).toBe(false);
        expect(isValidTaxReturn({...pdf, size: 0})).toBe(false);
        expect(isValidTaxReturn({...pdf, type: 'image/png'})).toBe(false);
        expect(isValidTaxReturn({...pdf, name: 'return.png'})).toBe(false);
        expect(isValidTaxReturn(undefined)).toBe(false);
    });

    test('keeps the request pending until the backend removes the domain marker', () => {
        // Given a domain with a server-owned pending request marker
        const pendingDomain = {private_limitRequestInProgress: true};
        // When the screen is opened again, or the backend clears the marker
        // Then pending survives reopening but clears when the marker is removed
        expect(hasLimitRequestInProgress(pendingDomain)).toBe(true);
        expect(hasLimitRequestInProgress({private_limitRequestInProgress: 1})).toBe(true);
        expect(hasLimitRequestInProgress({private_limitRequestInProgress: null})).toBe(false);
        expect(hasLimitRequestInProgress(undefined)).toBe(false);
    });

    test('blocks confirmation until the backend is available, and always blocks offline and pending requests', () => {
        // Given a complete form, including consent and a valid tax return
        const form = {
            desiredLimit: '50000',
            annualRevenue: '250000',
            taxReturnFile: {
                name: 'return.pdf',
                type: 'application/pdf',
                size: 1000,
            },
            hasAuthorized: true,
            isOffline: false,
            isPending: false,
            isSubmissionAvailable: true,
        };
        // When the backend is unavailable, the device is offline, or a request is pending
        // Then the admin cannot submit even a complete form
        expect(canSubmitLimitIncreaseRequest(form)).toBe(true);
        expect(canSubmitLimitIncreaseRequest({...form, isSubmissionAvailable: false})).toBe(false);
        expect(canSubmitLimitIncreaseRequest({...form, isOffline: true})).toBe(false);
        expect(canSubmitLimitIncreaseRequest({...form, isPending: true})).toBe(false);
        expect(canSubmitLimitIncreaseRequest({...form, hasAuthorized: false})).toBe(false);
    });
});
