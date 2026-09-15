import {fireEvent, render, screen} from '@testing-library/react-native';

import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import CONST from '@src/CONST';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function renderDescriptionFilter(onChange = jest.fn()) {
    return {
        onChange,
        ...render(
            <NavigationContainer>
                <TextInputFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION}
                    value="I"
                    isNegated={false}
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

    it('submits a generic Description filter with two onChange arguments and no match type selector', () => {
        const {onChange} = renderDescriptionFilter();

        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.confirm'));

        expect(onChange).toHaveBeenCalledWith('I', false);
        expect(onChange.mock.calls.at(0)).toHaveLength(2);
    });
});
