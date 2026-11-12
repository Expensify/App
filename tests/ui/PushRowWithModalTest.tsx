import {act, render} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import PushRowWithModal from '@src/components/PushRowWithModal';
import PushRowModal from '@src/components/PushRowWithModal/PushRowModal';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/MenuItem', () => ({
    __esModule: true,
    default: {
        Root: jest.fn(({children}: {children?: React.ReactNode}) => children),
        Chevron: () => null,
        BrickRoadIndicator: () => null,
        HelpText: () => null,
    },
}));
jest.mock('@components/MenuItem/presets/MenuItemField', () => ({__esModule: true, default: {Row: jest.fn(() => null)}}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));
jest.mock('@src/components/PushRowWithModal/PushRowModal', () => jest.fn(() => null));
jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {dismiss: () => Promise.resolve()},
}));

const optionsList = {RETAIL: 'Retail', SERVICES: 'Services', SOFTWARE: 'Software'};

describe('PushRowWithModal', () => {
    const mockedRow = jest.mocked(MenuItem.Root);
    const mockedFieldRow = jest.mocked(MenuItemField.Row);
    const mockedModal = jest.mocked(PushRowModal);
    const getRow = () => mockedRow.mock.lastCall?.[0];
    const getModal = () => mockedModal.mock.lastCall?.[0];

    beforeEach(() => {
        mockedRow.mockClear();
        mockedFieldRow.mockClear();
        mockedModal.mockClear();
    });

    function renderMultiSelect(value: string[], onInputChange: (value: string[]) => void, onBlur?: () => void) {
        render(
            <PushRowWithModal
                canSelectMultiple
                value={value}
                onInputChange={onInputChange}
                onBlur={onBlur}
                optionsList={optionsList}
                description="Industries"
                modalHeaderTitle="Industries"
                searchInputTitle="Industries"
            />,
        );
    }

    it('keeps an unchangeable answer non-interactive without dimming it', () => {
        // Given a field whose saved answer cannot be changed
        render(
            <PushRowWithModal
                value="RETAIL"
                shouldAllowChange={false}
                optionsList={optionsList}
                description="Industry"
                modalHeaderTitle="Industry"
                searchInputTitle="Industry"
            />,
        );

        // When the field row is composed
        const row = getRow();
        const field = mockedFieldRow.mock.lastCall?.[0];

        // Then it retains the answer without a press handler or disabled opacity
        expect(row?.onPress).toBeUndefined();
        expect(row?.isDisabled).toBe(false);
        expect(field?.name).toBe('Industry');
        expect(field?.value).toBe('Retail');
    });

    it('passes temporary disabled state to the root while retaining its edit action', () => {
        // Given an editable field temporarily unavailable, such as while offline
        render(
            <PushRowWithModal
                disabled
                optionsList={optionsList}
                description="Industry"
                modalHeaderTitle="Industry"
                searchInputTitle="Industry"
            />,
        );

        // When the row is composed
        const row = getRow();

        // Then the root blocks interaction and dims the row, rather than making the field permanently read-only
        expect(row?.isDisabled).toBe(true);
        expect(row?.onPress).toEqual(expect.any(Function));
        expect(mockedFieldRow.mock.lastCall?.[0].value).toBe('');
    });

    it('saves the ticked options together when the user presses Save', async () => {
        // Given a multi-select row with Retail saved
        const onInputChange = jest.fn();
        const onBlur = jest.fn();
        renderMultiSelect(['RETAIL'], onInputChange, onBlur);

        // When the user opens it, ticks Services, deselects Retail and saves
        act(() => getRow()?.onPress?.(createMock<GestureResponderEvent>({})));
        act(() => getModal()?.onOptionChange('SERVICES'));
        act(() => getModal()?.onOptionChange('RETAIL'));
        await act(async () => getModal()?.onConfirm?.());

        // Then only the final selection is saved, once, and the list closes without a blur, since a blur would validate the row before the new answer lands
        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith(['SERVICES']);
        expect(getModal()?.isVisible).toBe(false);
        expect(onBlur).not.toHaveBeenCalled();
    });

    it('discards the ticks when the user goes back without saving', async () => {
        // Given a multi-select row with Retail saved
        const onInputChange = jest.fn();
        const onBlur = jest.fn();
        renderMultiSelect(['RETAIL'], onInputChange, onBlur);

        // When the user opens it, ticks Services and goes back, then opens it again
        act(() => getRow()?.onPress?.(createMock<GestureResponderEvent>({})));
        act(() => getModal()?.onOptionChange('SERVICES'));
        await act(async () => getModal()?.onClose());
        act(() => getRow()?.onPress?.(createMock<GestureResponderEvent>({})));

        // Then nothing is saved, the row is blurred so the form validates the unchanged answer, and the list shows the saved selection again
        expect(onInputChange).not.toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(getModal()?.selectedOptions).toEqual(['RETAIL']);
        expect(mockedFieldRow.mock.lastCall?.[0].value).toBe('Retail');
    });

    it('drops a saved option missing from the list when the user saves', async () => {
        // Given a saved selection holding an option missing from the list, which has no row the user could deselect
        const onInputChange = jest.fn();
        renderMultiSelect(['WHOLESALE', 'RETAIL'], onInputChange);

        // When the user opens the list and saves
        act(() => getRow()?.onPress?.(createMock<GestureResponderEvent>({})));
        await act(async () => getModal()?.onConfirm?.());

        // Then only the offered option is saved, so the form can be submitted
        expect(onInputChange).toHaveBeenCalledWith(['RETAIL']);
    });

    it('saves a single choice as soon as it is picked and clears the dependent state input', () => {
        // Given a single-select country row that resets the state input, as in AddressFormFields
        const onInputChange = jest.fn();
        render(
            <PushRowWithModal
                value="US"
                onInputChange={onInputChange}
                stateInputIDToReset="state"
                optionsList={{US: 'United States', CA: 'Canada'}}
                description="Country"
                modalHeaderTitle="Country"
                searchInputTitle="Country"
            />,
        );

        // When the user picks Canada
        act(() => getModal()?.onOptionChange('CA'));

        // Then the country is saved right away with no Save step, and the state picked for the old country is cleared
        expect(getModal()?.canSelectMultiple).toBe(false);
        expect(onInputChange).toHaveBeenNthCalledWith(1, 'CA');
        expect(onInputChange).toHaveBeenNthCalledWith(2, '', 'state');
    });
});
