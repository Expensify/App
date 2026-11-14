import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import RangeDatePicker from '@components/Search/FilterComponents/RangeDatePicker';

import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

const defaultDateValues: SearchDateValues = {
    [CONST.SEARCH.DATE_MODIFIERS.ON]: '2025-01-15',
    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
};

const emptyDateValues: SearchDateValues = {
    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
};

const Stack = createStackNavigator();

function renderDateFilterBase(props: {
    onSubmit?: jest.Mock;
    onReset?: jest.Mock;
    defaultDateValues?: SearchDateValues;
    forceVerticalCalendars?: boolean;
    selectedDateModifier?: SearchDateModifier;
}) {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.SEARCH.ADVANCED_FILTERS_CONTENT_RHP}>
                    {() => (
                        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                            <DateFilterBase
                                title="Date"
                                defaultDateValues={props.defaultDateValues ?? defaultDateValues}
                                presets={[]}
                                onSubmit={props.onSubmit ?? jest.fn()}
                                onReset={props.onReset}
                                forceVerticalCalendars={props.forceVerticalCalendars}
                                selectedDateModifier={props.selectedDateModifier}
                            />
                        </ComposeProviders>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
}

describe('DateFilterBase reset', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it.each([
        [undefined, true],
        [true, true],
        [false, false],
    ])('passes calendar orientation %s through while preserving the default', (forceVerticalCalendars, expected) => {
        // Given a shared date filter, whose existing consumers need stacked calendars by default
        // When a containing pane requests an orientation for Custom range
        const view = renderDateFilterBase({forceVerticalCalendars, selectedDateModifier: CONST.SEARCH.DATE_MODIFIERS.RANGE});

        // Then the range picker receives that orientation, defaulting to vertical for unchanged callers
        expect(view.UNSAFE_getByType(RangeDatePicker).props.forceVertical).toBe(expected);
    });

    it('calls onReset with cleared date values when reset is pressed', () => {
        const onReset = jest.fn();
        renderDateFilterBase({onReset});

        const resetButton = screen.getByText(/^(Reset|common\.reset)$/);
        fireEvent.press(resetButton);

        expect(onReset).toHaveBeenCalledTimes(1);
        expect(onReset).toHaveBeenCalledWith(emptyDateValues);
    });
});
