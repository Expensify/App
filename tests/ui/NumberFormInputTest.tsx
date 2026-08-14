import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberForm from '@components/NumberForm';
import type {NumberFormInputProps, NumberFormRef} from '@components/NumberForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

function renderNumberForm(inputProps: Partial<NumberFormInputProps> = {}, rootProps: {value?: string; errorText?: string; onBlur?: jest.Mock; onInputChange?: jest.Mock} = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm
                {...rootProps}
                onInputChange={rootProps.onInputChange}
            >
                <NumberForm.Input {...inputProps} />
            </NumberForm>
        </ComposeProviders>,
    );
}

describe('NumberForm.Input', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a symbol and the canonical value', async () => {
        renderNumberForm({symbol: '$', position: 'prefix', decimals: 2}, {value: '12.50'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('$')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('12.50')).toBeOnTheScreen();
    });

    it('normalizes spaces and comma separators before notifying the root', async () => {
        const onInputChange = jest.fn();
        renderNumberForm({symbol: '$', decimals: 2}, {onInputChange});
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByDisplayValue(''), '1 2,5');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).toHaveBeenLastCalledWith('12.5');
        expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();
    });

    it('adds a leading zero on the standard text-input path', async () => {
        const onInputChange = jest.fn();
        renderNumberForm({displayAsTextInput: true, decimals: 2}, {onInputChange});
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByDisplayValue(''), '.5');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).toHaveBeenLastCalledWith('0.5');
        expect(screen.getByDisplayValue('0.5')).toBeOnTheScreen();
    });

    it('rejects values that exceed the configured decimal precision', async () => {
        const onInputChange = jest.fn();
        renderNumberForm({decimals: 0}, {value: '12', onInputChange});
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByDisplayValue('12'), '12.5');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('rejects negative values when negative mode is none', async () => {
        const onInputChange = jest.fn();
        renderNumberForm({decimals: 2}, {value: '12', onInputChange});
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByDisplayValue('12'), '-12');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('exposes the imperative number API without notifying the root on updateNumber', async () => {
        const numberFormRef = React.createRef<NumberFormRef>();
        const onInputChange = jest.fn();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberForm
                    value="10"
                    numberFormRef={numberFormRef}
                    onInputChange={onInputChange}
                >
                    <NumberForm.Input symbol="$" />
                </NumberForm>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(numberFormRef.current?.getNumber()).toBe('10');

        act(() => {
            numberFormRef.current?.updateNumber('25');
        });
        await waitForBatchedUpdatesWithAct();

        expect(numberFormRef.current?.getNumber()).toBe('25');
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
    });

    it('forwards the Form error, blur callback, and text-input ref', async () => {
        const inputRef = React.createRef<BaseTextInputRef>();
        const onBlur = jest.fn();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberForm
                    value="10"
                    errorText="Invalid number"
                    onBlur={onBlur}
                    ref={inputRef}
                >
                    <NumberForm.Input symbol="$" />
                </NumberForm>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(inputRef.current).toBeTruthy();
        expect(screen.getByText('Invalid number')).toBeOnTheScreen();

        fireEvent(screen.getByDisplayValue('10'), 'blur');
        expect(onBlur).toHaveBeenCalledTimes(1);
    });
});
