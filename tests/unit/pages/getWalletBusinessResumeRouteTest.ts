import getWalletBusinessResumeRoute from '@pages/ReimbursementAccount/utils/getWalletBusinessResumeRoute';

const pages = [
    {pageName: 'bank-info', subPages: ['details', 'confirmation']},
    {pageName: 'business-info', subPages: ['name', 'address', 'confirmation']},
] as const;

describe('getWalletBusinessResumeRoute', () => {
    it('resumes a valid local bank-information subpage before an account exists', () => {
        // Given a compatible Wallet draft saved before backend account creation
        // When its resume route is resolved against the initial backend fallback
        const route = getWalletBusinessResumeRoute({
            savedPage: 'bank-info',
            savedSubPage: 'confirmation',
            fallbackPage: 'country',
            fallbackSubPage: undefined,
            pages,
            hasBankAccountID: false,
            preAccountPage: 'bank-info',
        });

        // Then the local bank-information route is safe to restore
        expect(route).toEqual({page: 'bank-info', subPage: 'confirmation'});
    });

    it('resumes the exact saved subpage within the backend-derived major page', () => {
        // Given a created account whose saved and backend-derived major pages match
        // When its resume route is resolved
        const route = getWalletBusinessResumeRoute({
            savedPage: 'business-info',
            savedSubPage: 'address',
            fallbackPage: 'business-info',
            fallbackSubPage: 'name',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });

        // Then the exact focused subpage is restored
        expect(route).toEqual({page: 'business-info', subPage: 'address'});
    });

    it('restores the edit action only with a valid saved route', () => {
        // Given a Wallet business field was opened from confirmation for editing
        const validRoute = getWalletBusinessResumeRoute({
            savedPage: 'business-info',
            savedSubPage: 'address',
            savedAction: 'edit',
            fallbackPage: 'business-info',
            fallbackSubPage: 'name',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });
        const staleRoute = getWalletBusinessResumeRoute({
            savedPage: 'business-info',
            savedSubPage: 'address',
            savedAction: 'edit',
            fallbackPage: 'bank-info',
            fallbackSubPage: 'details',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });

        // When the routes are resolved, the valid field remains in edit mode but a fallback does not inherit stale edit state
        expect(validRoute).toEqual({page: 'business-info', subPage: 'address', action: 'edit'});
        expect(staleRoute).toEqual({page: 'bank-info', subPage: 'details'});
    });

    it('resumes an earlier saved page after the user navigates backward', () => {
        // Given the backend has advanced to business information while the user navigated back to bank information
        // When its resume route is resolved
        const route = getWalletBusinessResumeRoute({
            savedPage: 'bank-info',
            savedSubPage: 'confirmation',
            fallbackPage: 'business-info',
            fallbackSubPage: 'name',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });

        // Then the earlier focused page is restored without skipping ahead of the backend
        expect(route).toEqual({page: 'bank-info', subPage: 'confirmation'});
    });

    it('falls back for stale pages and invalid subpages', () => {
        // Given local progress that would skip ahead of the backend or has an invalid subpage
        const stalePageRoute = getWalletBusinessResumeRoute({
            savedPage: 'business-info',
            savedSubPage: 'address',
            fallbackPage: 'bank-info',
            fallbackSubPage: 'details',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });
        const invalidSubPageRoute = getWalletBusinessResumeRoute({
            savedPage: 'bank-info',
            savedSubPage: 'unknown',
            fallbackPage: 'bank-info',
            fallbackSubPage: 'details',
            pages,
            hasBankAccountID: true,
            preAccountPage: 'bank-info',
        });

        // Then both routes use the safe fallback
        expect(stalePageRoute).toEqual({page: 'bank-info', subPage: 'details'});
        expect(invalidSubPageRoute).toEqual({page: 'bank-info', subPage: 'details'});
    });

    it('does not restore a later major page before an account exists', () => {
        // Given stale local progress beyond the only pre-account page
        // When its route is resolved without a backend account
        const route = getWalletBusinessResumeRoute({
            savedPage: 'business-info',
            savedSubPage: 'address',
            fallbackPage: 'country',
            fallbackSubPage: undefined,
            pages,
            hasBankAccountID: false,
            preAccountPage: 'bank-info',
        });

        // Then it cannot skip ahead of account creation
        expect(route).toEqual({page: 'country', subPage: undefined});
    });
});
