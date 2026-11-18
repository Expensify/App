import {fireEvent, render, screen} from '@testing-library/react-native';

import type {MultiChoiceDropdownAdapterProps} from '@components/DynamicForm/adapters/MultiChoiceDropdownAdapter';
import MultiChoiceDropdownAdapter from '@components/DynamicForm/adapters/MultiChoiceDropdownAdapter';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MultiValuePickerPopover from '@components/ValuePicker/MultiValuePickerPopover';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@components/ValuePicker/MultiValuePickerPopover', () => jest.fn(() => null));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

const LABEL = 'Industries';
const ITEMS = [
    {value: 'RETAIL', label: 'Retail'},
    {value: 'SERVICES', label: 'Services'},
];

const lastPopoverProps = () => jest.mocked(MultiValuePickerPopover).mock.lastCall?.[0];

describe('MultiChoiceDropdownAdapter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(MultiValuePickerPopover).mockClear();
        jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => callback(16, 100, 300, 60));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderAdapter = (props: Partial<MultiChoiceDropdownAdapterProps> = {}) =>
        render(
            <LocaleContextProvider>
                <MultiChoiceDropdownAdapter
                    items={ITEMS}
                    label={LABEL}
                    title={LABEL}
                    {...props}
                />
            </LocaleContextProvider>,
        );

    const openList = () => fireEvent.press(screen.getByLabelText(LABEL, {exact: false}), {nativeEvent: {}});

    it('lists the picked options in the row', () => {
        // Given a field holding two options
        renderAdapter({value: ['SERVICES', 'RETAIL']});

        // When it renders
        // Then the row names both, in the order the list offers them
        expect(screen.getByText('Retail, Services')).toBeOnTheScreen();
    });

    it('commits the applied options once', () => {
        // Given a field holding Retail whose list is open
        const onInputChange = jest.fn();
        renderAdapter({value: ['RETAIL'], onInputChange});
        openList();

        // When the user applies Retail and Services
        lastPopoverProps()?.onApply(['RETAIL', 'SERVICES']);

        // Then the form gets both keys in one change
        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith(['RETAIL', 'SERVICES']);
    });

    it('does not report a change when the applied options are the ones the field holds', () => {
        // Given a field holding Retail and Services whose list is open
        const onInputChange = jest.fn();
        renderAdapter({value: ['RETAIL', 'SERVICES'], onInputChange});
        openList();

        // When the user applies the same options in another order
        lastPopoverProps()?.onApply(['SERVICES', 'RETAIL']);

        // Then nothing changes, so a field that asks the server for new requirements does not ask again for nothing
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('drops a value the field no longer offers when an untouched list is applied', () => {
        // Given a field holding Retail and a key its options no longer list, such as an old draft, whose list is open
        const onInputChange = jest.fn();
        renderAdapter({value: ['RETAIL', 'RETIRED'], onInputChange});
        openList();

        // When the user applies without changing anything, so the list hands back only the offered Retail
        lastPopoverProps()?.onApply(['RETAIL']);

        // Then the field keeps only Retail, so the hidden key the user can no longer see or uncheck is not submitted
        expect(onInputChange).toHaveBeenCalledWith(['RETAIL']);
    });

    it('treats an unanswered field as holding nothing', () => {
        // Given a field FormProvider started as an empty string
        renderAdapter({value: ''});
        openList();

        // When the list opens
        // Then it starts with nothing checked
        expect(lastPopoverProps()?.selectedValues).toEqual([]);
    });
});
