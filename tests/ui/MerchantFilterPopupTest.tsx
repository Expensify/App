import {fireEvent, render, screen} from '@testing-library/react-native';

import MerchantFilterPopup from '@components/Search/FilterDropdowns/MerchantFilterPopup';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));

function renderMerchantPopup(hasStoredMerchantOperator = true, values: Partial<SearchAdvancedFiltersForm> = {}) {
    const closeOverlay = jest.fn();
    const updateFilterForm = jest.fn<void, [Partial<SearchAdvancedFiltersForm>]>();

    const rendered = render(
        <NavigationContainer>
            <MerchantFilterPopup
                baseFilterKey={FILTER_KEYS.MERCHANT}
                values={{
                    [FILTER_KEYS.MERCHANT]: 'I',
                    ...(hasStoredMerchantOperator ? {[FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS} : {}),
                    ...values,
                }}
                label="common.merchant"
                closeOverlay={closeOverlay}
                updateFilterForm={updateFilterForm}
            />
        </NavigationContainer>,
    );

    return {closeOverlay, updateFilterForm, ...rendered};
}

describe('MerchantFilterPopup', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows and submits the Merchant match type', () => {
        const {closeOverlay, updateFilterForm} = renderMerchantPopup();

        expect(screen.getByText('search.filters.merchant.matchType')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.contains')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.exactMatch')).toBeOnTheScreen();

        fireEvent.press(screen.getByText('search.filters.merchant.exactMatch'));
        fireEvent.press(screen.getByText('common.apply'));

        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
        expect(closeOverlay).toHaveBeenCalledTimes(1);
    });

    it('keeps the exact operator and edited value when reopened', () => {
        const first = renderMerchantPopup();
        fireEvent.changeText(screen.getByLabelText('common.merchant'), 'Ibis');
        fireEvent.press(screen.getByText('search.filters.merchant.exactMatch'));
        fireEvent.press(screen.getByText('common.apply'));
        const savedValues = first.updateFilterForm.mock.calls.at(0)?.at(0);
        first.unmount();

        const reopened = renderMerchantPopup(true, savedValues);
        expect(screen.getByDisplayValue('Ibis')).toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.apply'));
        expect(reopened.updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'Ibis',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });

    it('defaults to Contains when no Merchant operator is stored', () => {
        const {updateFilterForm} = renderMerchantPopup(false);

        fireEvent.press(screen.getByText('common.apply'));

        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
    });

    it('hides the match type and submits exact matching for a negated Merchant', () => {
        const {updateFilterForm} = renderMerchantPopup();

        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));

        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.contains')).not.toBeOnTheScreen();
        expect(screen.queryByText('search.filters.merchant.exactMatch')).not.toBeOnTheScreen();

        fireEvent.press(screen.getByText('common.apply'));

        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: undefined,
            [FILTER_KEYS.MERCHANT_NOT]: 'I',
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });
});
