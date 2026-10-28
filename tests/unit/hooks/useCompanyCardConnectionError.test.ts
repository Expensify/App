import {renderHook} from '@testing-library/react-native';

import useCompanyCardConnectionError from '@hooks/useCompanyCardConnectionError';

import {getCardFeedWithDomainID} from '@libs/CardUtils';

import CONST from '@src/CONST';
import type {AddNewCompanyCardFeed, CombinedCardFeeds} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const newFeed = getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT, 1);
const errorKey = '1';

function getFeedWithErrors(errors?: Record<string, string>): CombinedCardFeeds {
    return createMock<CombinedCardFeeds>({
        [newFeed]: {errors},
    });
}

function getAddNewCardWithErrors(errors?: Record<string, string>): AddNewCompanyCardFeed {
    return createMock<AddNewCompanyCardFeed>({errors});
}

describe('useCompanyCardConnectionError', () => {
    it('returns an add-flow error', () => {
        // Given an add-card flow with an import error
        const addNewCard = getAddNewCardWithErrors({[errorKey]: 'Add card error'});

        // When the connection error hook is rendered for that flow
        const {result} = renderHook(() => useCompanyCardConnectionError({addNewCard, isAddingNewCard: true}));

        // Then it exposes the error and its message
        expect(result.current).toMatchObject({hasError: true, errorMessage: 'Add card error'});
    });

    it('returns a newly connected feed error', () => {
        // Given a newly connected feed with an error
        const cardFeeds = getFeedWithErrors({[errorKey]: 'Feed error'});

        // When the connection error hook is rendered for the new feed
        const {result} = renderHook(() => useCompanyCardConnectionError({cardFeeds, newFeed, isAddingNewCard: true}));

        // Then it exposes the feed error and its message
        expect(result.current).toMatchObject({hasError: true, errorMessage: 'Feed error'});
    });

    it('prioritizes the add-flow error when both error sources are present', () => {
        // Given both the add-card flow and newly connected feed have errors
        const addNewCard = getAddNewCardWithErrors({[errorKey]: 'Add card error'});
        const cardFeeds = getFeedWithErrors({[errorKey]: 'Feed error'});

        // When the connection error hook is rendered for the add-card flow
        const {result} = renderHook(() => useCompanyCardConnectionError({cardFeeds, addNewCard, newFeed, isAddingNewCard: true}));

        // Then it exposes the add-flow error first
        expect(result.current).toMatchObject({hasError: true, errorMessage: 'Add card error'});
    });

    it('ignores add-flow errors outside the add-card flow', () => {
        // Given a stale add-card error without a new feed error
        const addNewCard = getAddNewCardWithErrors({[errorKey]: 'Add card error'});

        // When the connection error hook is rendered for an existing feed
        const {result} = renderHook(() => useCompanyCardConnectionError({addNewCard, isAddingNewCard: false}));

        // Then the add-card error does not affect the existing-feed flow
        expect(result.current).toMatchObject({hasError: false, errorMessage: undefined});
    });
});
