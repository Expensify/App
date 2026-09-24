import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DatePresetFilterBase from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {CustomDateModifier, SearchDatePresetFilterBaseHandle, SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';

import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useRef, useState} from 'react';
import Onyx from 'react-native-onyx';

jest.mock('@libs/Navigation/Navigation');

const emptyDateValues: SearchDateValues = {
    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
};

const CUSTOM_DATE = /^(Custom date|search\.filters\.date\.customDate)$/;
const CUSTOM_DAY = /^(Custom day|search\.filters\.date\.customDay)$/;
const MODIFIER_ROWS = [/^(On|common\.on)$/, /^(Before|common\.before)$/, /^(After|common\.after)$/];

// MenuItem only forwards the press to onPress when it receives an event, so pass a minimal one.
const PRESS_EVENT = {nativeEvent: {}};

type HarnessProps = {
    defaultDateValues?: SearchDateValues;
    allowedCustomDateModifiers?: readonly CustomDateModifier[];
    onSelectDateModifier?: jest.Mock;
};

function DatePresetFilterBaseHarness({defaultDateValues = emptyDateValues, allowedCustomDateModifiers, onSelectDateModifier}: HarnessProps) {
    const ref = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    return (
        <DatePresetFilterBase
            ref={ref}
            defaultDateValues={defaultDateValues}
            selectedDateModifier={selectedDateModifier}
            onSelectDateModifier={(dateModifier) => {
                onSelectDateModifier?.(dateModifier);
                setSelectedDateModifier(dateModifier);
            }}
            presets={[]}
            allowedCustomDateModifiers={allowedCustomDateModifiers}
        />
    );
}

function renderDatePresetFilterBase(props: HarnessProps = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DatePresetFilterBaseHarness {...props} />
        </ComposeProviders>,
    );
}

describe('DatePresetFilterBase allowedCustomDateModifiers', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('keeps offering On, Before and After when no modifiers are passed', () => {
        // Given the picker as Search renders it, without restricting the custom date modifiers
        renderDatePresetFilterBase();

        // When the custom date option is opened
        fireEvent.press(screen.getByText(CUSTOM_DATE), PRESS_EVENT);

        // Then every modifier is still offered, so existing Search callers keep their behavior
        for (const row of MODIFIER_ROWS) {
            expect(screen.getByText(row)).toBeOnTheScreen();
        }
    });

    it('offers a single-day calendar labelled Custom day when only On is allowed', () => {
        // Given the picker as Insights renders it, which only reports on closed periods
        const onSelectDateModifier = jest.fn();
        renderDatePresetFilterBase({allowedCustomDateModifiers: [CONST.SEARCH.DATE_MODIFIERS.ON], onSelectDateModifier});
        expect(screen.queryByText(CUSTOM_DATE)).not.toBeOnTheScreen();

        // When the Custom day option is opened
        fireEvent.press(screen.getByText(CUSTOM_DAY), PRESS_EVENT);

        // Then the calendar opens on its own, since there is no modifier left to choose between
        expect(onSelectDateModifier).toHaveBeenCalledWith(CONST.SEARCH.DATE_MODIFIERS.ON);
        for (const row of MODIFIER_ROWS) {
            expect(screen.queryByText(row)).not.toBeOnTheScreen();
        }
    });

    it('opens on the allowed modifier even when the stored value uses a disallowed one', () => {
        // Given an unbounded Before date, which Insights does not support
        const onSelectDateModifier = jest.fn();
        renderDatePresetFilterBase({
            defaultDateValues: {...emptyDateValues, [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: '2026-03-04'},
            allowedCustomDateModifiers: [CONST.SEARCH.DATE_MODIFIERS.ON],
            onSelectDateModifier,
        });

        // When the Custom day option is opened
        fireEvent.press(screen.getByText(CUSTOM_DAY), PRESS_EVENT);

        // Then the picker switches to On rather than reviving the Before modifier the caller ruled out
        expect(onSelectDateModifier).toHaveBeenCalledWith(CONST.SEARCH.DATE_MODIFIERS.ON);
    });
});
