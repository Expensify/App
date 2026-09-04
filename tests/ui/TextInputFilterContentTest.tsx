import {fireEvent, render, screen} from '@testing-library/react-native';

import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import CONST from '@src/CONST';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function renderMerchantFilter(onChange = jest.fn(), hasStoredMerchantOperator = true) {
    return {
        onChange,
        ...render(
            <NavigationContainer>
                <TextInputFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value="I"
                    isNegated={false}
                    merchantOperator={hasStoredMerchantOperator ? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS : undefined}
                    onChange={onChange}
                />
            </NavigationContainer>,
        ),
    };
}

describe('TextInputFilterContent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('keeps the merchant input fixed above the Rules match type options', () => {
        // Given a positive Merchant Contains filter using the Rules layout.
        const {onChange} = renderMerchantFilter();
        const merchantInput = screen.getByLabelText('common.merchant');

        expect(screen.getByText('search.filters.merchant.matchType')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.contains')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.exactMatch')).toBeOnTheScreen();

        // When the user edits the input and changes the match type.
        fireEvent.changeText(merchantInput, 'Ibis');
        fireEvent.press(screen.getByText('search.filters.merchant.exactMatch'));

        // Then the input stays mounted with its current value.
        expect(screen.getByLabelText('common.merchant')).toBe(merchantInput);
        expect(screen.getByDisplayValue('Ibis')).toBeOnTheScreen();

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith('Ibis', false, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
    });

    it('submits the selected Contains operator from the Rules layout', () => {
        const {onChange} = renderMerchantFilter();

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith('I', false, CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
    });

    it('defaults to Contains when no Merchant operator is stored', () => {
        const {onChange} = renderMerchantFilter(jest.fn(), false);

        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith('I', false, CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
    });

    it('hides the merchant match type and omits the operator when the filter is negated', () => {
        // Given a positive Merchant Contains filter where both match options must be available.
        const {onChange} = renderMerchantFilter();
        const merchantInput = screen.getByLabelText('common.merchant');

        expect(screen.getByText('search.filters.merchant.matchType')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.contains')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.exactMatch')).toBeOnTheScreen();

        // When the user negates the filter because negated Merchant searches only support exact matching.
        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));

        // Then match options disappear so the UI matches the submitted query.
        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.contains')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.exactMatch')).not.toBeOnTheScreen();
        expect(screen.getByLabelText('common.merchant')).toBe(merchantInput);

        // When the user confirms the negated filter after match options disappear.
        fireEvent.press(screen.getByText('common.confirm'));

        // Then no Merchant operator is submitted because negated searches only support exact matching.
        expect(onChange).toHaveBeenCalledWith('I', true, undefined);
    });
});
