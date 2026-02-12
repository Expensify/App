/**
 * Currency codes that show the US/CA company cards empty state illustration.
 * US and Canada use the same card imagery.
 */
const CURRENCIES_US_CA = ['USD', 'CAD'] as const;

/**
 * Currency codes that show the UK/EU company cards empty state illustration.
 * UK and EU use the same card imagery.
 */
const CURRENCIES_UK_EU = ['GBP', 'EUR'] as const;

type CompanyCardsEmptyStateIllustrationKey = 'CompanyCardsEmptyStateUsCa' | 'CompanyCardsEmptyStateUkEu' | 'CompanyCardsEmptyStateGeneric';

/**
 * Returns the illustration key for the Company Cards empty state based on workspace currency.
 * - US and CA (USD, CAD) → companycards-us_ca.svg
 * - EU and UK (EUR, GBP) → companycards-uk_eu.svg
 * - All other currencies → companycards-generic.svg
 */
function getCompanyCardsEmptyStateIllustrationKey(currency?: string): CompanyCardsEmptyStateIllustrationKey {
    if (!currency) {
        return 'CompanyCardsEmptyStateGeneric';
    }
    const normalizedCurrency = currency.toUpperCase();
    if (CURRENCIES_US_CA.includes(normalizedCurrency as (typeof CURRENCIES_US_CA)[number])) {
        return 'CompanyCardsEmptyStateUsCa';
    }
    if (CURRENCIES_UK_EU.includes(normalizedCurrency as (typeof CURRENCIES_UK_EU)[number])) {
        return 'CompanyCardsEmptyStateUkEu';
    }
    return 'CompanyCardsEmptyStateGeneric';
}

export default getCompanyCardsEmptyStateIllustrationKey;
