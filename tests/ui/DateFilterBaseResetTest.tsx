import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

function renderDateFilterBase(props: {onSubmit?: jest.Mock; onReset?: jest.Mock; defaultDateValues?: SearchDateValues}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DateFilterBase
                title="Date"
                defaultDateValues={props.defaultDateValues ?? defaultDateValues}
                presets={[]}
                onSubmit={props.onSubmit ?? jest.fn()}
                onReset={props.onReset}
            />
        </ComposeProviders>,
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

    it('calls onReset with cleared date values when reset is pressed', () => {
        const onReset = jest.fn();
        renderDateFilterBase({onReset});

        const resetButton = screen.getByText(/^(Reset|common\.reset)$/);
        fireEvent.press(resetButton);

        expect(onReset).toHaveBeenCalledTimes(1);
        expect(onReset).toHaveBeenCalledWith(emptyDateValues);
    });
});
