import replaceCompanyCardsRoute from '@libs/Navigation/helpers/replaceCompanyCardsRoute';

describe('replaceCompanyCardsRoute', () => {
    const feed = 'oauth.mockbank.com%2322709230';
    const cardID = '2406988247305323';
    const cardDetailsPath = `workspaces/ABC123/company-cards/company-card-details/${feed}/${cardID}`;

    it('strips the parametric company-card export suffix', () => {
        expect(replaceCompanyCardsRoute(`${cardDetailsPath}/edit/export/${feed}/${cardID}`)).toBe(cardDetailsPath);
    });

    it('strips a bare /edit/export suffix', () => {
        expect(replaceCompanyCardsRoute(`${cardDetailsPath}/edit/export`)).toBe(cardDetailsPath);
    });

    it('preserves query params after stripping the parametric export suffix', () => {
        expect(replaceCompanyCardsRoute(`${cardDetailsPath}/edit/export/${feed}/${cardID}?foo=bar`)).toBe(`${cardDetailsPath}?foo=bar`);
    });

    it('returns the path unchanged when there is no export suffix', () => {
        expect(replaceCompanyCardsRoute(cardDetailsPath)).toBe(cardDetailsPath);
    });

    it('does not strip an accounting export path that is not a company-card selector', () => {
        const accountingExportPath = 'workspaces/ABC123/accounting/quickbooks-online/export';

        expect(replaceCompanyCardsRoute(accountingExportPath)).toBe(accountingExportPath);
    });
});
