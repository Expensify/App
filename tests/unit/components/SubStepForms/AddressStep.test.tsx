import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import AddressStep from '@components/SubStepForms/AddressStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type InputWrapperProps = {
    inputID: string;
    hint?: string;
    inputMode?: string;
    onValueChange?: (value: string) => void;
};

type FormProviderProps = {
    children: React.ReactNode;
    validate: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>;
    ref?: React.Ref<{resetFormFieldError: jest.Mock}>;
};

const mockInputWrapperProps: InputWrapperProps[] = [];
let mockValidateForm: FormProviderProps['validate'] = jest.fn();

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, value?: string) => (key === 'common.zipCodeExampleFormat' ? `e.g. ${value ?? ''}` : key),
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@components/Form/FormProvider', () => {
    const ReactActual = jest.requireActual('react');

    function MockFormProvider({children, validate, ref}: FormProviderProps) {
        mockValidateForm = validate;
        ReactActual.useImperativeHandle(ref, () => ({resetFormFieldError: jest.fn()}));
        return children;
    }

    return MockFormProvider;
});

jest.mock('@components/Form/InputWrapper', () => {
    const {Text} = jest.requireActual('react-native');

    function MockInputWrapper(props: InputWrapperProps) {
        mockInputWrapperProps.push(props);
        return <Text>{props.inputID}</Text>;
    }

    return MockInputWrapper;
});

jest.mock('@components/AddressSearch', () => 'AddressSearch');
jest.mock('@components/PushRowWithModal', () => 'PushRowWithModal');
jest.mock('@components/TextInput', () => 'TextInput');
jest.mock('@components/PatriotActLink', () => 'PatriotActLink');
jest.mock('@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks', () => 'HelpLinks');
jest.mock('@userActions/FormActions', () => ({
    setDraftValues: jest.fn(),
}));

const inputFieldsIDs = {
    street: 'ownerStreet',
    city: 'ownerCity',
    state: 'ownerState',
    zipCode: 'ownerZipCode',
    country: 'ownerCountry',
};

const defaultValues = {
    street: '1 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: CONST.COUNTRY.US,
};

function renderAddressStep() {
    return render(
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle="Owner info"
            onSubmit={jest.fn()}
            onNext={jest.fn()}
            isEditing
            stepFields={Object.values(inputFieldsIDs) as Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>}
            inputFieldsIDs={inputFieldsIDs}
            defaultValues={defaultValues}
            shouldDisplayCountrySelector
        />,
    );
}

function getLastInputProps(inputID: string) {
    const matchingProps = mockInputWrapperProps.filter((props) => props.inputID === inputID);
    return matchingProps[matchingProps.length - 1];
}

describe('AddressStep', () => {
    beforeEach(() => {
        mockInputWrapperProps.length = 0;
    });

    it('uses the current edit-mode country for ZIP validation and hint text', () => {
        renderAddressStep();

        expect(getLastInputProps(inputFieldsIDs.zipCode)?.hint).toBe(`e.g. ${COMMON_CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`);
        expect(getLastInputProps(inputFieldsIDs.zipCode)?.inputMode).toBe(CONST.INPUT_MODE.NUMERIC);

        act(() => {
            getLastInputProps(inputFieldsIDs.country)?.onValueChange?.(CONST.COUNTRY.GB);
        });

        expect(getLastInputProps(inputFieldsIDs.zipCode)?.hint).toBe(`e.g. ${COMMON_CONST.COUNTRY_ZIP_REGEX_DATA.GB.samples}`);
        expect(getLastInputProps(inputFieldsIDs.zipCode)?.inputMode).toBeUndefined();

        const errors = mockValidateForm({
            ...defaultValues,
            [inputFieldsIDs.country]: CONST.COUNTRY.GB,
            [inputFieldsIDs.zipCode]: 'SW1W 9SH',
        });

        expect(errors[inputFieldsIDs.zipCode]).toBeUndefined();
    });
});
