import {renderHook} from '@testing-library/react-native';
import React from 'react';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCards from '@hooks/useCompanyCards';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOtherFeedsForFeedSelector from '@hooks/useOtherFeedsForFeedSelector';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardFeedUtilsModule from '@libs/CardFeedUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const currentPolicyID = 'policy_current';
const otherPolicyID = 'policy_other';

const mockDomainCollection = {
    [`${ONYXKEYS.COLLECTION.DOMAIN}999`]: {email: 'admin@acme.corp'},
};

const mockPolicyCollection = {
    // POLICY collection entries are keyed by uppercase policy IDs, matching how the hook indexes them.
    [`${ONYXKEYS.COLLECTION.POLICY}${otherPolicyID.toUpperCase()}`]: {name: 'Other workspace'},
};

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]): [unknown, {status?: string}] => mockUseOnyx(...args) as [unknown, {status?: string}],
}));

jest.mock('@libs/CardFeedUtils', () => ({
    __esModule: true,
    ...jest.requireActual<typeof CardFeedUtilsModule>('@libs/CardFeedUtils'),
    getVisibleCompanyCardFeedsForSelector: jest.fn(),
}));

jest.mock('@hooks/useCompanyCards', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useFeedKeysWithAssignedCards', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useThemeIllustrations', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCompanyCardIcons', () => ({
    __esModule: true,
    useCompanyCardFeedIcons: jest.fn(),
}));

const mockVisibleFeeds = (feeds: CardFeedUtilsModule.CardFeedForDisplay[]): void => {
    (CardFeedUtilsModule.getVisibleCompanyCardFeedsForSelector as jest.Mock).mockReturnValue(feeds);
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

        (useLocalize as jest.Mock).mockReturnValue({translate: (phrase: string) => phrase});
        (useThemeStyles as jest.Mock).mockReturnValue({mr3: {marginRight: 12}, cardIcon: {}});
        (useThemeIllustrations as jest.Mock).mockReturnValue({});
        (useCompanyCardFeedIcons as jest.Mock).mockReturnValue({});
        (useCardFeedErrors as jest.Mock).mockReturnValue({shouldShowRbrForFeedNameWithDomainID: {}});
        (useCompanyCards as jest.Mock).mockReturnValue({feedName: undefined, companyCardFeeds: {}});
        (useCurrentUserPersonalDetails as jest.Mock).mockReturnValue({accountID: 999});
        (useFeedKeysWithAssignedCards as jest.Mock).mockReturnValue(undefined);
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
        (useCompanyCards as jest.Mock).mockReturnValue({feedName: undefined, companyCardFeeds: {[activePolicyFeedKey]: {feed: 'oauth.chase.com'}}});
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
        (useCompanyCards as jest.Mock).mockReturnValue({feedName: feedId, companyCardFeeds: {}});
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
        (useCardFeedErrors as jest.Mock).mockReturnValue({
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
