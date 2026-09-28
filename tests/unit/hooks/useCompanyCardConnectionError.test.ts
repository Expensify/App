import {renderHook, waitFor} from '@testing-library/react-native';

import useCompanyCardConnectionError from '@hooks/useCompanyCardConnectionError';

import {getCardFeedWithDomainID} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CombinedCardFeeds} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const newFeed = getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT, 1);
const errorKey = '1';

function getFeedWithErrors(errors?: Record<string, string>): CombinedCardFeeds {
    return createMock<CombinedCardFeeds>({
        [newFeed]: {errors},
    });
}

describe('useCompanyCardConnectionError', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns an add-flow error', async () => {
        // Given an add-card flow with an import error
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {errors: {[errorKey]: 'Add card error'}});
        await waitForBatchedUpdates();

        // When the connection error hook is rendered for that flow
        const {result} = renderHook(() => useCompanyCardConnectionError({isAddingNewCard: true}));

        // Then it exposes the error and its message
        await waitFor(() => expect(result.current).toMatchObject({hasError: true, errorMessage: 'Add card error'}));
    });

    it('returns a newly connected feed error', async () => {
        // Given a newly connected feed with an error
        const cardFeeds = getFeedWithErrors({[errorKey]: 'Feed error'});

        // When the connection error hook is rendered for the new feed
        const {result} = renderHook(() => useCompanyCardConnectionError({cardFeeds, newFeed, isAddingNewCard: true}));

        // Then it exposes the feed error and its message
        await waitFor(() => expect(result.current).toMatchObject({hasError: true, errorMessage: 'Feed error'}));
    });

    it('prioritizes the add-flow error when both error sources are present', async () => {
        // Given both the add-card flow and newly connected feed have errors
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {errors: {[errorKey]: 'Add card error'}});
        await waitForBatchedUpdates();
        const cardFeeds = getFeedWithErrors({[errorKey]: 'Feed error'});

        // When the connection error hook is rendered for the add-card flow
        const {result} = renderHook(() => useCompanyCardConnectionError({cardFeeds, newFeed, isAddingNewCard: true}));

        // Then it exposes the add-flow error first
        await waitFor(() => expect(result.current).toMatchObject({hasError: true, errorMessage: 'Add card error'}));
    });

    it('ignores add-flow errors outside the add-card flow', async () => {
        // Given a stale add-card error without a new feed error
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {errors: {[errorKey]: 'Add card error'}});
        await waitForBatchedUpdates();

        // When the connection error hook is rendered for an existing feed
        const {result} = renderHook(() => useCompanyCardConnectionError({isAddingNewCard: false}));

        // Then the add-card error does not affect the existing-feed flow
        await waitFor(() => expect(result.current).toMatchObject({hasError: false, errorMessage: undefined}));
    });
});
