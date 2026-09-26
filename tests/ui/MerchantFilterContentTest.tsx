import {fireEvent, render, screen} from '@testing-library/react-native';

import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import MerchantFilterContentPageWrapper from '@pages/Search/SearchAdvancedFiltersContentPage/MerchantFilterContentPageWrapper';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {MerchantMatchType} from '@src/types/form/SearchAdvancedFiltersForm';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function renderMerchantFilter({value = 'I', isNegated = false, merchantOperator}: {value?: string; isNegated?: boolean; merchantOperator?: MerchantMatchType} = {}) {
    const onChange = jest.fn();
    render(
        <NavigationContainer>
            <MerchantFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                value={value}
                isNegated={isNegated}
                merchantOperator={merchantOperator}
                onChange={onChange}
            />
        </NavigationContainer>,
    );
    return {onChange};
}

describe('MerchantFilterContent', () => {
    it('keeps the merchant input fixed above the match type options', () => {
        // Given a positive Merchant filter
        const {onChange} = renderMerchantFilter({merchantOperator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS});
        const merchantInput = screen.getByLabelText('common.merchant');

        // When the user edits the value and switches to Equal to
        fireEvent.changeText(merchantInput, 'Ibis');
        fireEvent.press(screen.getByText('search.filters.merchant.equalTo'));

        // Then the same input keeps the edited value, so switching the match type does not reset what the user typed
        expect(screen.getByLabelText('common.merchant')).toBe(merchantInput);
        expect(screen.getByDisplayValue('Ibis')).toBeOnTheScreen();

        // When the user confirms
        fireEvent.press(screen.getByText('common.confirm'));

        // Then the exact operator is submitted with the edited value
        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'Ibis',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });

    it.each([CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, undefined])('submits Contains when the stored operator is %s', (merchantOperator) => {
        // Given a Merchant filter stored as Contains, or with no operator from an older query
        const {onChange} = renderMerchantFilter({merchantOperator});

        // When the user confirms without changing the match type
        fireEvent.press(screen.getByText('common.confirm'));

        // Then Contains is submitted, because it is the default Merchant match type
        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('routes the Merchant filter through the advanced filters content with its stored operator', () => {
        // Given the advanced filters page renders a stored exact Merchant filter with an Apply label
        const onChange = jest.fn();
        render(
            <NavigationContainer>
                <SearchAdvancedFiltersContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    values={{merchant: 'I', merchantOperator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO}}
                    buttonText="common.apply"
                    components={{Merchant: MerchantFilterContentPageWrapper, Text: () => null, Amount: () => null, Date: () => null, ReportField: () => null, List: () => null}}
                    onChange={onChange}
                />
            </NavigationContainer>,
        );

        // When the user applies the filter
        fireEvent.press(screen.getByText('common.apply'));

        // Then the stored exact operator is kept, so the Merchant content received it from the form values
        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });

    it('retains the value when changing a stored negative filter back to positive', () => {
        // Given a stored negated Merchant filter
        const {onChange} = renderMerchantFilter({value: 'Prime', isNegated: true});

        // When the user switches it to positive and picks Contains
        fireEvent.press(screen.getByText('search.filters.filterType.is.positive'));
        fireEvent.press(screen.getByText('search.filters.merchant.contains'));
        fireEvent.press(screen.getByText('common.confirm'));

        // Then the negated value moves to the positive filter instead of being cleared
        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'Prime',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('hides the match type and submits no operator when the filter is negated', () => {
        // Given a positive Merchant filter
        const {onChange} = renderMerchantFilter({merchantOperator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS});

        // When the user negates it
        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));

        // Then the match type is hidden, because a negated Merchant filter always uses the not-equal operator
        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();

        // When the user confirms
        fireEvent.press(screen.getByText('common.confirm'));

        // Then only the negated value is submitted
        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: undefined,
            [FILTER_KEYS.MERCHANT_NOT]: 'I',
            [FILTER_KEYS.MERCHANT_OPERATOR]: undefined,
        });
    });
});
