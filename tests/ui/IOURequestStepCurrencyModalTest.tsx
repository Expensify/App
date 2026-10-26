import {fireEvent, render, screen} from '@testing-library/react-native';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import React from 'react';

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/CurrencySelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));

describe('IOURequestStepCurrencyModal', () => {
    it('selects Any currency as an empty currency and closes the picker', () => {
        // Given an amount filter that permits currency-agnostic comparisons.
        const onInputChange = jest.fn();
        const hidePickerModal = jest.fn();
        render(
            <IOURequestStepCurrencyModal
                isPickerVisible
                hidePickerModal={hidePickerModal}
                headerText="Select a currency"
                value="USD"
                onInputChange={onInputChange}
                shouldAllowEmptySelection
            />,
        );

        // When Any currency is selected instead of a currency code.
        fireEvent.press(screen.getByText('common.anyCurrency'), {nativeEvent: {}});

        // Then the caller receives the empty selection used by legacy operands.
        expect(onInputChange).toHaveBeenCalledWith('');
        expect(hidePickerModal).toHaveBeenCalledTimes(1);
    });

    it('does not offer Any currency when a currency is required', () => {
        // Given a money-request picker whose selection must remain a currency code.
        // When the picker opens without allowing an empty selection.
        render(
            <IOURequestStepCurrencyModal
                isPickerVisible
                hidePickerModal={jest.fn()}
                headerText="Select a currency"
                value="USD"
                onInputChange={jest.fn()}
            />,
        );

        // Then money requests cannot select the search-only Any currency option.
        expect(screen.queryByText('common.anyCurrency')).toBeNull();
    });
});
