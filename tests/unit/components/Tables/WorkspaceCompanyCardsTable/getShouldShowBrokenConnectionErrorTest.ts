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

    it('does not show the error for a direct feed with no broken connection and no feed errors', () => {
        const feedErrors = buildFeedErrors({});

        expect(getShouldShowBrokenConnectionError(DIRECT_FEED, feedErrors)).toBe(false);
    });

    it('does not show the error when there are no feed errors at all', () => {
        expect(getShouldShowBrokenConnectionError(DIRECT_FEED, undefined)).toBe(false);
    });
});
