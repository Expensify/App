import {act, renderHook} from '@testing-library/react-native';

import useSavedAmountInput from '@components/ReportActionItem/MoneyRequestViewFields/useSavedAmountInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import createMock from '../../utils/createMock';

describe('useSavedAmountInput', () => {
    it('blurs the input on Enter, so the typed amount is saved the way leaving the input saves it', () => {
        // Given an amount input the user is typing in, which submits rather than blurs on Enter
        const blur = jest.fn();
        const {result} = renderHook(() => useSavedAmountInput({amount: 1000, decimals: 2, getAmountError: () => '', onSave: jest.fn()}));
        result.current.inputRef.current = createMock<BaseTextInputRef>({blur});

        // When Enter submits the input
        act(() => result.current.blurInput());

        // Then the input is blurred, which runs the save on blur
        expect(blur).toHaveBeenCalledTimes(1);
    });
});
