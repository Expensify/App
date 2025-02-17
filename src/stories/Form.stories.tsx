import type {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';
import type {ComponentType} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import type {FormProviderProps} from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Picker from '@components/Picker';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import NetworkConnection from '@libs/NetworkConnection';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import {defaultStyles} from '@src/styles';
import type {Form} from '@src/types/form';
import type {Network} from '@src/types/onyx';

type FormStory = StoryFn<FormProviderProps & FormProviderOnyxProps>;

type StorybookFormValues = {
    routingNumber?: string;
    accountNumber?: string;
    street?: string;
    dob?: string;
    pickFruit?: string;
    pickAnotherFruit?: string;
    state?: string;
    checkbox?: boolean;
};

type FormProviderOnyxProps = {
    /** Contains the form state that must be accessed outside the component */
    formState: OnyxEntry<Form>;

    /** Contains draft values for each input in the form */
    draftValues: OnyxEntry<Form>;

    /** Information about the network */
    network: OnyxEntry<Network>;
};

type StorybookFormErrors = Partial<Record<keyof StorybookFormValues, string>>;

const STORYBOOK_FORM_ID = 'TestForm' as keyof OnyxFormValuesMapping;

const story: Meta<typeof FormProvider> = {
    title: 'Components/Form',
    component: FormProvider,
    subcomponents: {
        InputWrapper: InputWrapper as ComponentType<unknown>,
        TextInput: TextInput as ComponentType<unknown>,
        AddressSearch: AddressSearch as ComponentType<unknown>,
        CheckboxWithLabel: CheckboxWithLabel as ComponentType<unknown>,
        Picker: Picker as ComponentType<unknown>,
        StateSelector: StateSelector as ComponentType<unknown>,
        DatePicker: DatePicker as ComponentType<unknown>,
    },
};

function Template(props: FormProviderProps & FormProviderOnyxProps) {
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(props.formID, !!props.formState?.isLoading);
    FormActions.setDraftValues(props.formID, props.draftValues);

    if (props.formState?.error) {
        FormActions.setErrors(props.formID, {error: props.formState.error as string});
    } else {
        FormActions.clearErrors(props.formID);
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...props}>
            <View>
                <InputWrapper
                    InputComponent={TextInput}
                    role={CONST.ROLE.PRESENTATION}
                    accessibilityLabel="Routing number"
                    label="Routing number"
                    inputID="routingNumber"
                    shouldSaveDraft
                />
            </View>
            <InputWrapper
                InputComponent={TextInput}
                role={CONST.ROLE.PRESENTATION}
                label="Account number"
                accessibilityLabel="Account number"
                inputID="accountNumber"
                containerStyles={defaultStyles.mt4}
            />
            <InputWrapper
                InputComponent={AddressSearch}
                label="Street"
                inputID="street"
                containerStyles={defaultStyles.mt4}
                hint="common.noPO"
            />
            <InputWrapper
                InputComponent={DatePicker}
                inputID="dob"
                label="Date of Birth"
                containerStyles={defaultStyles.mt4}
            />
            <View>
                <InputWrapper
                    InputComponent={Picker}
                    label="Fruit"
                    inputID="pickFruit"
                    onInputChange={() => {}}
                    containerStyles={defaultStyles.mt4}
                    shouldSaveDraft
                    items={[
                        {
                            label: 'Select a Fruit',
                            value: '',
                        },
                        {
                            label: 'Orange',
                            value: 'orange',
                        },
                        {
                            label: 'Apple',
                            value: 'apple',
                        },
                    ]}
                />
            </View>
            <InputWrapper
                InputComponent={Picker}
                label="Another Fruit"
                inputID="pickAnotherFruit"
                onInputChange={() => {}}
                containerStyles={defaultStyles.mt4}
                items={[
                    {
                        label: 'Select a Fruit',
                        value: '',
                    },
                    {
                        label: 'Orange',
                        value: 'orange',
                    },
                    {
                        label: 'Apple',
                        value: 'apple',
                    },
                ]}
            />
            <View style={defaultStyles.mt4}>
                <InputWrapper
                    InputComponent={StateSelector}
                    inputID="state"
                    shouldSaveDraft
                />
            </View>
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                inputID="checkbox"
                style={[defaultStyles.mb4, defaultStyles.mt5]}
                // eslint-disable-next-line react/no-unstable-nested-components
                LabelComponent={() => <Text>I accept the Expensify Terms of Service</Text>}
            />
        </FormProvider>
    );
}

/**
 * Story to exhibit the native event handlers for TextInput in the Form Component
 */
function WithNativeEventHandler(props: FormProviderProps & FormProviderOnyxProps) {
    const [log, setLog] = useState('');

    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(props.formID, !!props.formState?.isLoading);
    FormActions.setDraftValues(props.formID, props.draftValues);

    if (props.formState?.error) {
        FormActions.setErrors(props.formID, {error: props.formState.error as string});
    } else {
        FormActions.clearErrors(props.formID);
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...props}>
            <InputWrapper
                InputComponent={TextInput}
                role={CONST.ROLE.PRESENTATION}
                accessibilityLabel="Routing number"
                label="Routing number"
                inputID="routingNumber"
                onChangeText={setLog}
                shouldSaveDraft
            />
            <Text>{`Entered routing number: ${log}`}</Text>
        </FormProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: FormStory = Template.bind({});
const Loading: FormStory = Template.bind({});
const ServerError: FormStory = Template.bind({});
const InputError: FormStory = Template.bind({});

const defaultArgs = {
    formID: STORYBOOK_FORM_ID,
    submitButtonText: 'Submit',
    validate: (values: StorybookFormValues) => {
        const errors: StorybookFormErrors = {};
        if (!ValidationUtils.isRequiredFulfilled(values.routingNumber)) {
            errors.routingNumber = 'Please enter a routing number';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.accountNumber)) {
            errors.accountNumber = 'Please enter an account number';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.street)) {
            errors.street = 'Please enter an address';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.dob)) {
            errors.dob = 'Please enter your date of birth';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.pickFruit)) {
            errors.pickFruit = 'Please select a fruit';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.pickAnotherFruit)) {
            errors.pickAnotherFruit = 'Please select a fruit';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.state)) {
            errors.state = 'Please select a state';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.checkbox)) {
            errors.checkbox = 'You must accept the Terms of Service to continue';
        }
        return errors;
    },
    onSubmit: (values: StorybookFormValues) => {
        setTimeout(() => {
            alert(`Form submitted!\n\nInput values: ${JSON.stringify(values, null, 4)}`);
            FormActions.setIsLoading(STORYBOOK_FORM_ID, false);
        }, 1000);
    },
    formState: {
        isLoading: false,
        error: '',
    },
    draftValues: {
        routingNumber: '00001',
        accountNumber: '1111222233331111',
        street: '123 Happy St, Happyland HP 12345',
        dob: '1990-01-01',
        pickFruit: 'orange',
        pickAnotherFruit: 'apple',
        state: 'AL',
        checkbox: false,
    },
};

Default.args = defaultArgs;
Loading.args = {...defaultArgs, formState: {isLoading: true}};
ServerError.args = {...defaultArgs, formState: {isLoading: false, error: 'There was an unexpected error. Please try again later.'}};
InputError.args = {
    ...defaultArgs,
    draftValues: {
        routingNumber: '',
        accountNumber: '',
        street: '',
        pickFruit: '',
        dob: '',
        pickAnotherFruit: '',
        state: '',
        checkbox: false,
    },
};

WithNativeEventHandler.args = {...defaultArgs, draftValues: {routingNumber: '', accountNumber: ''}};

export default story;
export {Default, Loading, ServerError, InputError, WithNativeEventHandler};
