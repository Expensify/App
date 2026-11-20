import getShouldShowBrokenConnectionError from '@components/Tables/WorkspaceCompanyCardsTable/getShouldShowBrokenConnectionError';

import CONST from '@src/CONST';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardFeedErrorState} from '@src/types/onyx/DerivedValues';

const DOMAIN_ID = '11111111';

const DIRECT_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ID}` as CompanyCardFeedWithDomainID;
const COMMERCIAL_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ID}` as CompanyCardFeedWithDomainID;
const CSV_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CSV}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ID}` as CompanyCardFeedWithDomainID;

function buildFeedErrors(overrides: Partial<CardFeedErrorState>): CardFeedErrorState {
    return {
        shouldShowRBR: false,
        hasFeedErrors: false,
        hasWorkspaceErrors: false,
        isFeedConnectionBroken: false,
        shouldPromptBrokenConnection: false,
        hasFeedConnectionIssue: false,
        ...overrides,
    };
}

describe('getShouldShowBrokenConnectionError', () => {
    it('shows the error for a broken direct (OAuth/Plaid) feed even without feed errors', () => {
        const feedErrors = buildFeedErrors({isFeedConnectionBroken: true});

        expect(getShouldShowBrokenConnectionError(DIRECT_FEED, feedErrors)).toBe(true);
    });

    it('does not show the error for a broken commercial feed when the feed itself has no errors', () => {
        const feedErrors = buildFeedErrors({isFeedConnectionBroken: true});

        expect(getShouldShowBrokenConnectionError(COMMERCIAL_FEED, feedErrors)).toBe(false);
    });

    it('shows the error for a commercial feed when the feed itself has errors', () => {
        const feedErrors = buildFeedErrors({isFeedConnectionBroken: true, hasFeedErrors: true});

        expect(getShouldShowBrokenConnectionError(COMMERCIAL_FEED, feedErrors)).toBe(true);
    });

    it('does not show the error for a broken non-direct file-based feed (e.g. CSV) without feed errors', () => {
        const feedErrors = buildFeedErrors({isFeedConnectionBroken: true});

        expect(getShouldShowBrokenConnectionError(CSV_FEED, feedErrors)).toBe(false);
    });

    it('does not show the error for a direct feed whose only issue is an actionable scrape status', () => {
        // Given a card issue such as 434 without a broken feed connection
        const feedErrors = buildFeedErrors({hasFeedConnectionIssue: true});

        // When deciding whether the whole feed needs a broken connection warning
        const shouldShowError = getShouldShowBrokenConnectionError(DIRECT_FEED, feedErrors);

        // Then an individual card issue must not label the feed as broken
        expect(shouldShowError).toBe(false);
    });

    it('still shows a genuine broken direct connection alongside an actionable card issue', () => {
        // Given a real connection failure coexisting with an individual card issue
        const feedErrors = buildFeedErrors({isFeedConnectionBroken: true, hasFeedConnectionIssue: true});

        // When deciding whether the feed needs a warning
        const shouldShowError = getShouldShowBrokenConnectionError(DIRECT_FEED, feedErrors);

        // Then the individual card issue must not hide the genuine failure
        expect(shouldShowError).toBe(true);
    });

    it.each([DIRECT_FEED, COMMERCIAL_FEED, CSV_FEED])('still shows explicit feed errors alongside a card issue for %s', (feedName) => {
        // Given a feed error without a broken scrape status, alongside an individual card issue
        const feedErrors = buildFeedErrors({hasFeedErrors: true, hasFeedConnectionIssue: true});

        // When deciding whether the feed needs a warning
        const shouldShowError = getShouldShowBrokenConnectionError(feedName, feedErrors);

        // Then explicit feed errors remain visible regardless of feed type
        expect(shouldShowError).toBe(true);
    });

    it('does not show the error for a commercial feed whose only issue is an actionable scrape status', () => {
        const feedErrors = buildFeedErrors({hasFeedConnectionIssue: true});

        expect(getShouldShowBrokenConnectionError(COMMERCIAL_FEED, feedErrors)).toBe(false);
    });

    it('does not show the error for a direct feed with no broken connection and no feed errors', () => {
        const feedErrors = buildFeedErrors({});

        expect(getShouldShowBrokenConnectionError(DIRECT_FEED, feedErrors)).toBe(false);
    });

    it('does not show the error when there are no feed errors at all', () => {
        expect(getShouldShowBrokenConnectionError(DIRECT_FEED, undefined)).toBe(false);
    });
});
