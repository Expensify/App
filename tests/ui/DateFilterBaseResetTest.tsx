import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import DatePicker from '@components/DatePicker';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import RangeDateInputs from '@components/Search/FilterComponents/RangeDateInputs';
import RangeDatePicker from '@components/Search/FilterComponents/RangeDatePicker';
import type {RangeDatePickerProps} from '@components/Search/FilterComponents/RangeDatePicker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {ComponentType} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation', () => {
    const navigation = jest.requireActual<{default: Record<string, unknown>}>('@libs/Navigation/__mocks__/Navigation');
    return {__esModule: true, default: {...navigation.default, getTopmostReportId: jest.fn()}};
});

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

function renderDateFilterBase(props: {onSubmit?: jest.Mock; onReset?: jest.Mock; defaultDateValues?: SearchDateValues; RangePicker?: ComponentType<RangeDatePickerProps>}) {
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
                                RangePicker={props.RangePicker}
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

    it('saves compact range fields without showing a redundant range summary', () => {
        // Given the compact range editor used in the Filters popup
        const onSubmit = jest.fn();
        const view = renderDateFilterBase({onSubmit, RangePicker: RangeDateInputs});
        fireEvent.press(screen.getByText(/^(Custom range|search\.filters\.date\.customRange)$/), {nativeEvent: {}});

        // When both date fields are selected and saved
        const [from, to] = view.UNSAFE_getAllByType(DatePicker);
        if (!from || !to) {
            throw new Error('Missing range fields');
        }
        fireEvent(from, 'inputChange', '2026-03-05');
        fireEvent(to, 'inputChange', '2026-03-10');
        expect(screen.queryByText(/^(Range|common\.range):/)).toBeNull();
        fireEvent.press(screen.getByText(/^(Save|common\.save)$/));

        // Then only the range is submitted, replacing any previous custom date
        expect(onSubmit).toHaveBeenCalledWith({...emptyDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: '2026-03-05,2026-03-10'});
    });

    it('discards compact range edits when going Back', () => {
        // Given a saved range open in the compact editor
        const savedValues = {...emptyDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: '2026-03-05,2026-03-10'};
        const view = renderDateFilterBase({defaultDateValues: savedValues, RangePicker: RangeDateInputs});
        fireEvent.press(screen.getByText(/^(Custom range|search\.filters\.date\.customRange)$/), {nativeEvent: {}});
        const [from] = view.UNSAFE_getAllByType(DatePicker);
        if (!from) {
            throw new Error('Missing From field');
        }

        // When From is changed but the user leaves with Back instead of saving
        fireEvent(from, 'inputChange', '2026-03-06');
        fireEvent.press(screen.getByLabelText(/^(Back|common\.back)$/), {nativeEvent: {}});
        fireEvent.press(screen.getByText(/^(Custom range|search\.filters\.date\.customRange)$/), {nativeEvent: {}});

        // Then reopening shows the saved date, not the discarded edit
        expect(view.UNSAFE_getAllByType(DatePicker).at(0)?.props.value).toBe('2026-03-05');
    });

    it('requires both compact range bounds before saving', () => {
        // Given a saved range whose To field has been cleared
        const onSubmit = jest.fn();
        const view = renderDateFilterBase({
            onSubmit,
            defaultDateValues: {...emptyDateValues, [CONST.SEARCH.DATE_MODIFIERS.RANGE]: '2026-03-05,2026-03-10'},
            RangePicker: RangeDateInputs,
        });
        fireEvent.press(screen.getByText(/^(Custom range|search\.filters\.date\.customRange)$/), {nativeEvent: {}});
        const [, to] = view.UNSAFE_getAllByType(DatePicker);
        if (!to) {
            throw new Error('Missing To field');
        }
        fireEvent(to, 'inputChange', '');

        // When the user tries to save
        fireEvent.press(screen.getByText(/^(Save|common\.save)$/));

        // Then the existing validation error is shown and no range is submitted
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/Please select dates for both|search\.errors\.pleaseSelectDatesForBothFromAndTo/)).toBeOnTheScreen();
    });

    it('keeps the full calendars for callers that do not replace the range editor', () => {
        // Given an existing date filter without a compact editor override
        const view = renderDateFilterBase({});

        // When Custom range is opened
        fireEvent.press(screen.getByText(/^(Custom range|search\.filters\.date\.customRange)$/), {nativeEvent: {}});

        // Then its existing range calendar component is still used
        expect(view.UNSAFE_getByType(RangeDatePicker)).toBeTruthy();
        expect(view.UNSAFE_queryAllByType(DatePicker)).toHaveLength(0);
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
