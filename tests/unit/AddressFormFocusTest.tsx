import {render} from '@testing-library/react-native';

import AddressForm from '@components/AddressForm';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';

import type {ReactNode} from 'react';

const mockInputWrapper = jest.fn();

jest.mock('@components/Form/FormProvider', () => ({__esModule: true, default: ({children}: {children: ReactNode}) => children}));
jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: {inputID: string; autoFocus?: boolean}) => {
        mockInputWrapper(props);
        return null;
    },
}));

describe('AddressForm focus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([undefined, false, true])('only focuses Address line 1 when requested: %s', (shouldAutoFocusAddressLine1) => {
        // Given an address form whose caller may opt in to focus
        // When it renders with the same fields used by the home-address page
        render(
            <AddressForm
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                onSubmit={jest.fn()}
                shouldAutoFocusAddressLine1={shouldAutoFocusAddressLine1}
            />,
        );

        // Then only Address line 1 receives focus intent, and the default leaves existing callers unchanged
        expect(mockInputWrapper).toHaveBeenCalledWith(expect.objectContaining({inputID: INPUT_IDS.ADDRESS_LINE_1, autoFocus: shouldAutoFocusAddressLine1 ?? false}));
        const otherFields = mockInputWrapper.mock.calls.filter(([props]: [{inputID: string}]) => props.inputID !== INPUT_IDS.ADDRESS_LINE_1);
        for (const [props] of otherFields) {
            expect(props).not.toHaveProperty('autoFocus', true);
        }
    });
});
