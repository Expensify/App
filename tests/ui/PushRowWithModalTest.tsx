import {act, render} from '@testing-library/react-native';

import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import PushRowWithModal from '@src/components/PushRowWithModal';
import PushRowModal from '@src/components/PushRowWithModal/PushRowModal';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock('@src/components/PushRowWithModal/PushRowModal', () => jest.fn(() => null));
jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {dismiss: () => Promise.resolve()},
}));

const optionsList = {RETAIL: 'Retail', SERVICES: 'Services', SOFTWARE: 'Software'};

describe('PushRowWithModal', () => {
    const mockedRow = jest.mocked(MenuItemWithTopDescription);
    const mockedModal = jest.mocked(PushRowModal);
    const getRow = () => mockedRow.mock.lastCall?.[0];
    const getModal = () => mockedModal.mock.lastCall?.[0];

    beforeEach(() => {
        mockedRow.mockClear();
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
        expect(getRow()?.title).toBe('Retail');
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
