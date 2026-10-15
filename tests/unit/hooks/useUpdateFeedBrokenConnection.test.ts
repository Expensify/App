import {renderHook} from '@testing-library/react-native';

import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';

import {updateWorkspaceCompanyCard} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const MOCK_DOMAIN_ID = 555;
const MOCK_CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;
const MOCK_WORKSPACE_ACCOUNT_ID = 777;
const MOCK_BANK = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const MOCK_FEED = `${MOCK_BANK}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${MOCK_DOMAIN_ID}` as CompanyCardFeedWithDomainID;

let mockCardFeeds: Record<string, unknown> = {};
let mockCardsWithBrokenFeedConnection: Record<string, unknown> = {};

jest.mock('@userActions/CompanyCards', () => ({
    updateWorkspaceCompanyCard: jest.fn(),
}));
jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => ({policyAccountID: MOCK_WORKSPACE_ACCOUNT_ID}),
}));
jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: () => [mockCardFeeds],
}));
jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => ({
        cardFeedErrors: {[MOCK_FEED]: {isFeedConnectionBroken: true}},
        cardsWithBrokenFeedConnection: mockCardsWithBrokenFeedConnection,
    }),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: MOCK_CURRENT_USER_ID}),
}));
jest.mock('@libs/CardUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/CardUtils'),
    getCompanyFeeds: (feeds: unknown) => feeds,
}));

function setBrokenCards() {
    mockCardsWithBrokenFeedConnection = {
        owned: {fundID: MOCK_DOMAIN_ID, bank: MOCK_BANK, accountID: MOCK_CURRENT_USER_ID},
        other: {fundID: MOCK_DOMAIN_ID, bank: MOCK_BANK, accountID: OTHER_USER_ID},
    };
}

describe('useUpdateFeedBrokenConnection', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        setBrokenCards();
    });

    it('only syncs cards owned by the user on a domain feed when the user is not a domain admin', async () => {
        // Given a domain feed the user is not an admin of, with a broken owned card and a broken card of someone else
        mockCardFeeds = {[MOCK_FEED]: {domainID: MOCK_DOMAIN_ID}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${MOCK_DOMAIN_ID}`, {
            accountID: MOCK_DOMAIN_ID,
        });
        await waitForBatchedUpdates();

        // When updating the broken connection
        const {result} = renderHook(() => useUpdateFeedBrokenConnection({policyID: 'P1', feed: MOCK_FEED}));
        result.current.updateBrokenConnection();

        // Then only the owned card is synced
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledTimes(1);
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledWith(MOCK_DOMAIN_ID, 'owned', expect.anything(), undefined);
    });

    it('syncs all cards on a domain feed when the user is a domain admin', async () => {
        // Given a domain feed the user is an admin of
        mockCardFeeds = {[MOCK_FEED]: {domainID: MOCK_DOMAIN_ID}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${MOCK_DOMAIN_ID}`, {
            accountID: MOCK_DOMAIN_ID,
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${MOCK_CURRENT_USER_ID}` as const]: MOCK_CURRENT_USER_ID,
        });
        await waitForBatchedUpdates();

        // When updating the broken connection
        const {result} = renderHook(() => useUpdateFeedBrokenConnection({policyID: 'P1', feed: MOCK_FEED}));
        result.current.updateBrokenConnection();

        // Then every broken card is synced
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledTimes(2);
    });

    it('syncs all cards on a workspace feed', () => {
        // Given a workspace feed without a domainID
        mockCardFeeds = {[MOCK_FEED]: {}};

        // When updating the broken connection
        const {result} = renderHook(() => useUpdateFeedBrokenConnection({policyID: 'P1', feed: MOCK_FEED}));
        result.current.updateBrokenConnection();

        // Then every broken card is synced against the workspace account
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledTimes(2);
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledWith(MOCK_WORKSPACE_ACCOUNT_ID, 'owned', expect.anything(), undefined);
    });

    it('syncs all cards on a workspace feed whose domainID equals the workspace account ID for a non-domain-admin', () => {
        // Given a workspace feed that carries the workspace account ID as domainID, and a user who is not a domain admin
        mockCardFeeds = {[MOCK_FEED]: {domainID: MOCK_WORKSPACE_ACCOUNT_ID}};

        // When updating the broken connection
        const {result} = renderHook(() => useUpdateFeedBrokenConnection({policyID: 'P1', feed: MOCK_FEED}));
        result.current.updateBrokenConnection();

        // Then every broken card is synced
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledTimes(2);
        expect(updateWorkspaceCompanyCard).toHaveBeenCalledWith(MOCK_WORKSPACE_ACCOUNT_ID, 'other', expect.anything(), undefined);
    });
});
