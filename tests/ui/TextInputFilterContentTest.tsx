import {fireEvent, render, screen} from '@testing-library/react-native';

import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import CONST from '@src/CONST';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function renderMerchantFilter(onChange = jest.fn()) {
    return {
        onChange,
        ...render(
            <TextInputFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                value="I"
                isNegated={false}
                merchantOperator={CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS}
                onChange={onChange}
            />,
        ),
    };
}

describe('TextInputFilterContent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('hides the merchant match type and omits the operator when the filter is negated', () => {
        // Given a positive Merchant Contains filter where both match options must be available.
        const {onChange} = renderMerchantFilter();

        expect(screen.getByRole('button', {name: 'search.filters.merchant.equalTo'})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'search.filters.merchant.contains'})).toBeOnTheScreen();

        // When the user negates the filter because negated Merchant searches only support exact matching.
        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));

        // Then match options disappear so the UI matches the submitted query.
        expect(screen.queryByRole('button', {name: 'search.filters.merchant.equalTo'})).not.toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: 'search.filters.merchant.contains'})).not.toBeOnTheScreen();
        expect(screen.getByLabelText('common.merchant')).toBeOnTheScreen();

        // When the user confirms the negated filter after match options disappear.
        fireEvent.press(screen.getByText('common.confirm'));

        // Then no Merchant operator is submitted because negated searches only support exact matching.
        expect(onChange).toHaveBeenCalledWith('I', true, undefined);
    });
});
