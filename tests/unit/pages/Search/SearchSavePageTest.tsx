import {render} from '@testing-library/react-native';

import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterTaxRateValue from '@components/Search/hooks/useFilterTaxRateValue';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import SearchSavePage from '@pages/Search/SearchSavePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Card, CardList} from '@src/types/onyx';

import React from 'react';

import createMock from '../../../utils/createMock';
import {translateLocal} from '../../../utils/TestHelper';

jest.mock('@components/Form/FormProvider', () => jest.fn((props: React.PropsWithChildren) => props.children));
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn((props: React.PropsWithChildren) => props.children));
jest.mock('@components/Search/hooks/useFilterFeedValue');
jest.mock('@components/Search/hooks/useFilterTaxRateValue');
jest.mock('@components/Search/SearchContext', () => ({useSearchQueryContext: jest.fn(() => ({currentSearchQueryJSON: undefined}))}));
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({convertToDisplayStringWithoutCurrency: jest.fn()}))}));
jest.mock('@hooks/useLocalize');
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
const cards = createMock<CardList>({});
cards[12] = createMock<Card>({cardID: 12, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD, state: CONST.EXPENSIFY_CARD.STATE.OPEN, nameValuePairs: {cardTitle: 'Selected Alpha'}});
cards[23] = createMock<Card>({cardID: 23, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD, state: CONST.EXPENSIFY_CARD.STATE.OPEN, nameValuePairs: {cardTitle: 'Selected Beta'}});
cards[123] = createMock<Card>({cardID: 123, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD, state: CONST.EXPENSIFY_CARD.STATE.OPEN, nameValuePairs: {cardTitle: 'Unselected Overlap'}});
let form: Partial<SearchAdvancedFiltersForm>;
jest.mocked(useLocalize).mockReturnValue(createMock<ReturnType<typeof useLocalize>>({translate: translateLocal, localeCompare: (a, b) => a.localeCompare(b)}));
jest.mocked(useFilterFeedValue).mockImplementation((value) => `feed:${value?.join('|')}`);
jest.mocked(useFilterTaxRateValue).mockImplementation((value) => `tax:${value.join('|')}`);
jest.mocked(useOnyx).mockImplementation((key) => {
    switch (key) {
        case ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM:
            return [form, {status: 'loaded'}];
        case ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST:
            return [cards, {status: 'loaded'}];
        default:
            return [undefined, {status: 'loaded'}];
    }
});
beforeEach(() => jest.clearAllMocks());
it.each([[['12']], [['12', '23']]])('renders canonical card selection %j exactly', (cardID) => {
    form = {cardID, feed: ['feed-a', 'feed-b'], taxRate: ['tax-a', 'tax-b'], merchant: 'Coffee Shop'};
    const output = JSON.stringify(render(<SearchSavePage />).toJSON());
    expect(['Selected Alpha', 'Selected Beta', 'Unselected Overlap'].map((text) => output.includes(text))).toEqual([true, cardID.length === 2, false]);
    expect(['12', '23', '123'].map((rawID) => output.includes(rawID))).toEqual([false, false, false]);
    expect([jest.mocked(useFilterFeedValue).mock.calls.at(0)?.at(0), jest.mocked(useFilterTaxRateValue).mock.calls.at(0)?.at(0)]).toEqual([
        ['feed-a', 'feed-b'],
        ['tax-a', 'tax-b'],
    ]);
    expect(['feed:feed-a|feed-b', 'tax:tax-a|tax-b', 'Coffee Shop'].map((text) => output.includes(text))).toEqual([true, true, true]);
});
