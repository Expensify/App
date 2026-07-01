import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('NumberWithSymbolForm', () => {
    const buildTree = (value: string, decimals: number) => (
        <NavigationContainer>
            <LocaleContextProvider>
                <NumberWithSymbolForm
                    value={value}
                    decimals={decimals}
                    symbol="$"
                />
            </LocaleContextProvider>
        </NavigationContainer>
    );

    it('truncates to the new decimal precision instead of deleting all decimals when decimals shrinks', async () => {
        const {rerender} = render(buildTree('125.567', 3));

        await waitForBatchedUpdatesWithAct();

        // Currency changes to one that supports only 2 decimals: the amount should be truncated to 2
        // decimal digits (125.56), not have its entire fractional part wiped out (125).
        rerender(buildTree('125.567', 2));

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByDisplayValue('125.56')).toBeDefined();
    });

    it('drops the decimal point entirely when the new currency supports zero decimals', async () => {
        const {rerender} = render(buildTree('125.50', 2));

        await waitForBatchedUpdatesWithAct();

        rerender(buildTree('125.50', 0));

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByDisplayValue('125')).toBeDefined();
    });
});
