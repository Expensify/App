import {renderHook} from '@testing-library/react-native';
import React from 'react';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCards from '@hooks/useCompanyCards';
import useLocalize from '@hooks/useLocalize';
import useOtherFeedsForFeedSelector from '@hooks/useOtherFeedsForFeedSelector';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const currentPolicyID = 'policy_current';
const otherPolicyID = 'policy_other';

const mockDomainCollection = {
    [`${ONYXKEYS.COLLECTION.DOMAIN}999`]: {email: 'admin@acme.corp'},
};

const mockPolicyCollection = {
    [`${ONYXKEYS.COLLECTION.POLICY}${otherPolicyID}`]: {name: 'Other workspace'},
};

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]): [unknown, {status?: string}] => mockUseOnyx(...args) as [unknown, {status?: string}],
}));

jest.mock('@hooks/useCardFeedsForActivePolicies', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCompanyCards', () => ({
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
        (useCompanyCards as jest.Mock).mockReturnValue({feedName: undefined});
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({cardFeedsByPolicy: {}});
    });

    it('should return an empty list when cardFeedsByPolicy is empty', () => {
        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toEqual([]);
    });

    it('should exclude feeds already linked to the current policy', () => {
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: '999_oauth.chase.com',
                        feed: 'oauth.chase.com',
                        fundID: '999',
                        name: 'Chase feed',
                        linkedPolicyIDs: [currentPolicyID],
                        country: 'US',
                    },
                ],
            },
        });

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toHaveLength(0);
    });

    it('should include feeds from other policies that are not linked to the current policy', () => {
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: '999_oauth.chase.com',
                        feed: 'oauth.chase.com',
                        fundID: '999',
                        name: 'Chase feed',
                        linkedPolicyIDs: ['policy_unrelated'],
                        country: 'US',
                    },
                ],
            },
        });

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toHaveLength(1);
        // Use toMatchObject so Jest does not deep-compare leftElement (React nodes use private fields and break toEqual).
        expect(result.current.at(0)).toMatchObject({
            value: '999_oauth.chase.com',
            feed: 'oauth.chase.com',
            fundID: 999,
            country: 'US',
            keyForList: `${otherPolicyID}_999_oauth.chase.com`,
            isSelected: false,
        });
        expect(React.isValidElement(result.current.at(0)?.leftElement)).toBe(true);
    });

    it('should set isSelected when feed id matches the selected feed from useCompanyCards', () => {
        const feedId = '999_oauth.chase.com';
        (useCompanyCards as jest.Mock).mockReturnValue({feedName: feedId});
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: feedId,
                        feed: 'oauth.chase.com',
                        fundID: '999',
                        name: 'Chase feed',
                        linkedPolicyIDs: ['policy_unrelated'],
                    },
                ],
            },
        });

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)?.isSelected).toBe(true);
    });

    it('should surface RBR when shouldShowRbrForFeedNameWithDomainID is true for the feed id', () => {
        const feedId = '999_visa';
        (useCardFeedErrors as jest.Mock).mockReturnValue({
            shouldShowRbrForFeedNameWithDomainID: {[feedId]: true},
        });
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: feedId,
                        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                        fundID: '999',
                        name: 'Visa feed',
                        linkedPolicyIDs: ['policy_unrelated'],
                    },
                ],
            },
        });

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)).toMatchObject({
            brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            canShowSeveralIndicators: true,
        });
    });

    it('should use domain email domain for alternateText when domain data exists', () => {
        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: '999_visa',
                        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                        fundID: '999',
                        name: 'Visa feed',
                        linkedPolicyIDs: ['policy_unrelated'],
                    },
                ],
            },
        });

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

        (useCardFeedsForActivePolicies as jest.Mock).mockReturnValue({
            cardFeedsByPolicy: {
                [otherPolicyID]: [
                    {
                        id: '888_visa',
                        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                        fundID: '888',
                        name: 'Visa feed',
                        linkedPolicyIDs: [otherPolicyID],
                    },
                ],
            },
        });

        const {result} = renderHook(() => useOtherFeedsForFeedSelector(currentPolicyID));

        expect(result.current.at(0)?.alternateText).toBe('Other workspace');
    });
});
