import getBankAccountSuccessState from '@pages/workspace/expensifyCard/getBankAccountSuccessState';

describe('getBankAccountSuccessState', () => {
    it('waits for Onyx hydration and an in-flight provisioning request', () => {
        // Given a provisioned US feed whose Onyx value is still loading
        const settings = {US: {paymentBankAccountID: 1234}};
        // When Onyx is hydrating or the account selection write is still in progress
        // Then the success screen must not display the limit or the reviewing proxy yet
        expect(getBankAccountSuccessState(456, settings, true, true, false, false)).toBe('loading');
        expect(getBankAccountSuccessState(456, {...settings, isLoading: true}, false, true, false, false)).toBe('loading');
        expect(getBankAccountSuccessState(456, {US: {...settings.US, isLoading: true}}, false, true, false, false)).toBe('loading');
    });

    it('does not show reviewing when the fund has not resolved or the US feed is not provisioned', () => {
        // Given a missing fund or a loaded feed with no settlement account
        // When the success screen checks its data
        // Then neither state is treated as a review decision
        expect(getBankAccountSuccessState(0, {US: {paymentBankAccountID: 1234}}, false, true, false, false)).toBe('unavailable');
        expect(getBankAccountSuccessState(456, {US: {}}, false, true, false, false)).toBe('unavailable');
        expect(getBankAccountSuccessState(456, undefined, false, false, false, true)).toBe('unavailable');
    });

    it('waits for the cards page to load before treating missing settings as unavailable', () => {
        // Given a valid fund but no loaded settings yet
        // When the central cards page is still fetching, then later finishes or fails
        // Then show loading first and an unavailable state rather than a false reviewing label afterward
        expect(getBankAccountSuccessState(456, undefined, false, false, false, false)).toBe('loading');
        expect(getBankAccountSuccessState(456, undefined, false, true, false, false)).toBe('unavailable');
        expect(getBankAccountSuccessState(456, undefined, false, false, true, false)).toBe('unavailable');
    });

    it('only shows the success screen for a provisioned US feed even if its limit is absent', () => {
        // Given a provisioned feed without an assigned limit
        // When the feed has loaded and is no longer being provisioned
        // Then the success screen may use the missing-limit reviewing proxy
        expect(getBankAccountSuccessState(456, {US: {paymentBankAccountID: 1234}}, false, true, false, false)).toBe('ready');
    });
});
