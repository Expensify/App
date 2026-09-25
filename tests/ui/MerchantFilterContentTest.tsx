import {fireEvent, render, screen} from '@testing-library/react-native';

import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import MerchantFilterContentPageWrapper from '@pages/Search/SearchAdvancedFiltersContentPage/MerchantFilterContentPageWrapper';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function renderMerchantFilter(onChange = jest.fn(), merchantOperator = CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS) {
    return {
        onChange,
        ...render(
            <NavigationContainer>
                <MerchantFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value="I"
                    isNegated={false}
                    merchantOperator={merchantOperator}
                    onChange={onChange}
                />
            </NavigationContainer>,
        ),
    };
}

describe('MerchantFilterContent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('keeps the merchant input fixed above the match type options', () => {
        const {onChange} = renderMerchantFilter();
        const merchantInput = screen.getByLabelText('common.merchant');

        expect(screen.getByText('search.filters.merchant.matchType')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.contains')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.exactMatch')).toBeOnTheScreen();

        fireEvent.changeText(merchantInput, 'Ibis');
        fireEvent.press(screen.getByText('search.filters.merchant.exactMatch'));

        expect(screen.getByLabelText('common.merchant')).toBe(merchantInput);
        expect(screen.getByDisplayValue('Ibis')).toBeOnTheScreen();

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'Ibis',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });

    it('submits the selected Contains operator', () => {
        const {onChange} = renderMerchantFilter();

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('applies the Merchant filter directly when the page supplies an Apply label', () => {
        const onChange = jest.fn();
        render(
            <NavigationContainer>
                <SearchAdvancedFiltersContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    values={{merchant: 'I', merchantOperator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS}}
                    buttonText="common.apply"
                    components={{Merchant: MerchantFilterContentPageWrapper, Text: () => null, Amount: () => null, Date: () => null, ReportField: () => null, List: () => null}}
                    onChange={onChange}
                />
            </NavigationContainer>,
        );

        expect(screen.queryByText('common.confirm')).not.toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.apply'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('defaults to Contains when no Merchant operator is stored', () => {
        const onChange = jest.fn();
        render(
            <NavigationContainer>
                <MerchantFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value="I"
                    isNegated={false}
                    onChange={onChange}
                />
            </NavigationContainer>,
        );

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('retains the value when changing a stored negative filter back to positive', () => {
        const onChange = jest.fn();
        render(
            <NavigationContainer>
                <MerchantFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value="Prime"
                    isNegated
                    merchantOperator={CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO}
                    onChange={onChange}
                />
            </NavigationContainer>,
        );

        fireEvent.press(screen.getByText('search.filters.filterType.is.positive'));
        expect(screen.getByDisplayValue('Prime')).toBeOnTheScreen();
        fireEvent.press(screen.getByText('search.filters.merchant.contains'));
        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'Prime',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('hides match type controls and uses exact matching when the filter is negated', () => {
        const {onChange} = renderMerchantFilter();
        const merchantInput = screen.getByLabelText('common.merchant');

        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));

        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.contains')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.exactMatch')).not.toBeOnTheScreen();
        expect(screen.getByLabelText('common.merchant')).toBe(merchantInput);

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: undefined,
            [FILTER_KEYS.MERCHANT_NOT]: 'I',
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });
});
