import {renderHook} from '@testing-library/react-native';

import useOtherFeedsForFeedSelector from '@hooks/useOtherFeedsForFeedSelector';

import {getVisibleCompanyCardFeedsForSelector} from '@libs/CardFeedUtils';
import type {CardFeedForDisplay} from '@libs/CardFeedUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const currentPolicyID = 'policy_current';
const otherPolicyID = 'policy_other';

const mockDomainCollection = {
    [`${ONYXKEYS.COLLECTION.DOMAIN}999`]: {email: 'admin@acme.corp'},
};

const mockPolicyCollection = {
    // POLICY collection entries are keyed by uppercase policy IDs, matching how the hook indexes them.
    [`${ONYXKEYS.COLLECTION.POLICY}${otherPolicyID.toUpperCase()}`]: {name: 'Other workspace'},
};

type MockUseOnyxReturn = [unknown, {status?: string}];
type MockUseLocalizeReturn = {translate: (phrase: string) => string};
type MockUseThemeStylesReturn = {mr3: {marginRight: number}; cardIcon: Record<string, never>};
type MockUseCardFeedErrorsReturn = {shouldShowRbrForFeedNameWithDomainID: Record<string, boolean>};
type MockUseCompanyCardsReturn = {feedName?: string; companyCardFeeds: Record<string, {feed: string}>};
type MockUseCurrentUserPersonalDetailsReturn = {accountID: number};
type MockUseFeedKeysWithAssignedCardsReturn = Record<string, true> | undefined;

const mockUseOnyx = jest.fn<MockUseOnyxReturn, [key: string]>();
const mockUseCardFeedErrors = jest.fn<MockUseCardFeedErrorsReturn, []>();
const mockUseCompanyCardFeedIcons = jest.fn<Record<string, never>, []>();
const mockUseCompanyCards = jest.fn<MockUseCompanyCardsReturn, [{policyID: string}]>();
const mockUseCurrentUserPersonalDetails = jest.fn<MockUseCurrentUserPersonalDetailsReturn, []>();
const mockUseFeedKeysWithAssignedCards = jest.fn<MockUseFeedKeysWithAssignedCardsReturn, []>();
const mockUseLocalize = jest.fn<MockUseLocalizeReturn, []>();
const mockUseThemeIllustrations = jest.fn<Record<string, never>, []>();
const mockUseThemeStyles = jest.fn<MockUseThemeStylesReturn, []>();
const mockGetCardFeedIcon = jest.fn<string, []>();
const mockGetCardFeedWithDomainID = jest.fn<string, [feed: string, fundID: number]>();
const mockGetCustomOrFormattedFeedName = jest.fn<string, [translate: MockUseLocalizeReturn['translate'], feedName: string, customName?: string]>();
const mockGetDomainByFundID = jest.fn<{email?: string} | undefined, [allDomains: Record<string, {email?: string}> | undefined, fundID: number]>();
const mockGetPlaidInstitutionIconUrl = jest.fn<string | undefined, [feedName: string]>();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string): MockUseOnyxReturn => mockUseOnyx(key),
}));

jest.mock('@libs/CardFeedUtils', () => ({
    __esModule: true,
    getVisibleCompanyCardFeedsForSelector: jest.fn(),
}));

jest.mock('@libs/CardUtils', () => ({
    __esModule: true,
    getCardFeedIcon: (): string => mockGetCardFeedIcon(),
    getCardFeedWithDomainID: (feed: string, fundID: number): string => mockGetCardFeedWithDomainID(feed, fundID),
    getCustomOrFormattedFeedName: (translate: MockUseLocalizeReturn['translate'], feedName: string, customName?: string): string =>
        mockGetCustomOrFormattedFeedName(translate, feedName, customName),
    getDomainByFundID: (allDomains: Record<string, {email?: string}> | undefined, fundID: number): {email?: string} | undefined => mockGetDomainByFundID(allDomains, fundID),
    getPlaidInstitutionIconUrl: (feedName: string): string | undefined => mockGetPlaidInstitutionIconUrl(feedName),
}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: 'Icon',
}));

jest.mock('@components/PlaidCardFeedIcon', () => ({
    __esModule: true,
    default: 'PlaidCardFeedIcon',
}));

jest.mock('@hooks/useCompanyCards', () => ({
    __esModule: true,
    default: ({policyID}: {policyID: string}): MockUseCompanyCardsReturn => mockUseCompanyCards({policyID}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: (): MockUseCurrentUserPersonalDetailsReturn => mockUseCurrentUserPersonalDetails(),
}));

jest.mock('@hooks/useFeedKeysWithAssignedCards', () => ({
    __esModule: true,
    default: (): MockUseFeedKeysWithAssignedCardsReturn => mockUseFeedKeysWithAssignedCards(),
}));

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: (): MockUseCardFeedErrorsReturn => mockUseCardFeedErrors(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: (): MockUseLocalizeReturn => mockUseLocalize(),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: (): MockUseThemeStylesReturn => mockUseThemeStyles(),
}));

jest.mock('@hooks/useThemeIllustrations', () => ({
    __esModule: true,
    default: (): Record<string, never> => mockUseThemeIllustrations(),
}));

jest.mock('@hooks/useCompanyCardIcons', () => ({
    __esModule: true,
    useCompanyCardFeedIcons: (): Record<string, never> => mockUseCompanyCardFeedIcons(),
}));

const mockGetVisibleCompanyCardFeedsForSelector = jest.mocked(getVisibleCompanyCardFeedsForSelector);

const mockVisibleFeeds = (feeds: CardFeedForDisplay[]): void => {
    mockGetVisibleCompanyCardFeedsForSelector.mockReturnValue(feeds);
};

describe('useOtherFeedsForFeedSelector', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
                return [mockDomainCollection, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [mockPolicyCollection, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        mockUseLocalize.mockReturnValue({translate: (phrase: string) => phrase});
        mockUseThemeStyles.mockReturnValue({mr3: {marginRight: 12}, cardIcon: {}});
        mockUseThemeIllustrations.mockReturnValue({});
        mockUseCompanyCardFeedIcons.mockReturnValue({});
        mockUseCardFeedErrors.mockReturnValue({shouldShowRbrForFeedNameWithDomainID: {}});
        mockUseCompanyCards.mockReturnValue({feedName: undefined, companyCardFeeds: {}});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 999});
        mockUseFeedKeysWithAssignedCards.mockReturnValue(undefined);
        mockGetCardFeedIcon.mockReturnValue('mock-icon');
        mockGetCardFeedWithDomainID.mockImplementation((feed: string, fundID: number) => `${feed}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${fundID}`);
        mockGetCustomOrFormattedFeedName.mockImplementation((translate: MockUseLocalizeReturn['translate'], feedName: string, customName?: string) => customName ?? translate(feedName));
        mockGetDomainByFundID.mockImplementation((allDomains: Record<string, {email?: string}> | undefined, fundID: number) => allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`]);
        mockGetPlaidInstitutionIconUrl.mockReturnValue(undefined);
        mockVisibleFeeds([]);
    });

    it('should return an empty list when there are no visible feeds', () => {
        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toEqual([]);
    });

    it('should exclude feeds already linked to the current policy', () => {
        mockVisibleFeeds([
            {
                id: '999_oauth.chase.com',
                feed: 'oauth.chase.com',
                fundID: '999',
                name: 'Chase feed',
                linkedPolicyIDs: [currentPolicyID],
                country: 'US',
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toHaveLength(0);
    });

    it('should exclude feeds already present in the active policy available list', () => {
        // Build the key the same way production does (`${feed}${separator}${fundID}`) via a computed property name,
        // which keeps the dotted feed key out of a string literal and avoids a naming-convention violation.
        const activePolicyFeedKey = `oauth.chase.com${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}999`;
        mockUseCompanyCards.mockReturnValue({feedName: undefined, companyCardFeeds: {[activePolicyFeedKey]: {feed: 'oauth.chase.com'}}});
        mockVisibleFeeds([
            {
                id: '999_oauth.chase.com',
                feed: 'oauth.chase.com',
                fundID: '999',
                name: 'Chase feed',
                linkedPolicyIDs: ['policy_unrelated'],
                country: 'US',
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toHaveLength(0);
    });

    it('should include feeds that are not linked to the current policy', () => {
        mockVisibleFeeds([
            {
                id: '999_oauth.chase.com',
                feed: 'oauth.chase.com',
                fundID: '999',
                name: 'Chase feed',
                linkedPolicyIDs: ['policy_unrelated'],
                country: 'US',
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toHaveLength(1);
        // Use toMatchObject so Jest does not deep-compare leftElement (React nodes use private fields and break toEqual).
        expect(result.current.at(0)).toMatchObject({
            value: '999_oauth.chase.com',
            feed: 'oauth.chase.com',
            fundID: 999,
            country: 'US',
            // Stable, deduped key: feed.id is unique per feed (no per-policy composite).
            keyForList: '999_oauth.chase.com',
            isSelected: false,
        });
        expect(React.isValidElement(result.current.at(0)?.leftElement)).toBe(true);
    });

    it('should set isSelected when feed id matches the selected feed from useCompanyCards', () => {
        const feedId = '999_oauth.chase.com';
        mockUseCompanyCards.mockReturnValue({feedName: feedId, companyCardFeeds: {}});
        mockVisibleFeeds([
            {
                id: feedId,
                feed: 'oauth.chase.com',
                fundID: '999',
                name: 'Chase feed',
                linkedPolicyIDs: ['policy_unrelated'],
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)?.isSelected).toBe(true);
    });

    it('should surface RBR when shouldShowRbrForFeedNameWithDomainID is true for the feed id', () => {
        const feedId = '999_visa';
        mockUseCardFeedErrors.mockReturnValue({
            shouldShowRbrForFeedNameWithDomainID: {[feedId]: true},
        });
        mockVisibleFeeds([
            {
                id: feedId,
                feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                fundID: '999',
                name: 'Visa feed',
                linkedPolicyIDs: ['policy_unrelated'],
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)).toMatchObject({
            brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            canShowSeveralIndicators: true,
        });
    });

    it('should use domain email domain for alternateText when domain data exists', () => {
        mockVisibleFeeds([
            {
                id: '999_visa',
                feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                fundID: '999',
                name: 'Visa feed',
                linkedPolicyIDs: ['policy_unrelated'],
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)?.alternateText).toBe('acme.corp');
    });

    it('should use linked policy name for alternateText when domain email is missing', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
                return [{}, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [mockPolicyCollection, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        mockVisibleFeeds([
            {
                id: '888_visa',
                feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                fundID: '888',
                name: 'Visa feed',
                linkedPolicyIDs: [otherPolicyID],
            },
        ]);

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)?.alternateText).toBe('Other workspace');
    });
});
