import type {ComponentMeta, Story} from '@storybook/react';
import React, {useState} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import type {FormProviderProps} from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Picker from '@components/Picker';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import NetworkConnection from '@libs/NetworkConnection';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultStyles} from '@src/styles';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type FormStory = Story<FormProviderProps<typeof ONYXKEYS.FORMS.TEST_FORM>>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: ComponentMeta<typeof FormProvider> = {
    title: 'Components/Form',
    component: FormProvider,
    subcomponents: {
        InputWrapper,
        TextInput,
        AddressSearch,
        CheckboxWithLabel,
        Picker,
        StatePicker,
        DatePicker,
    },
};

function Template(args: FormProviderProps<typeof ONYXKEYS.FORMS.TEST_FORM>) {
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(args.formID, !!args.formState?.isLoading);
    FormActions.setErrors(args.formID, args.formState?.error as unknown as Errors);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...args}>
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
                    InputComponent={StatePicker}
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
function WithNativeEventHandler(args: FormProviderProps<typeof ONYXKEYS.FORMS.TEST_FORM>) {
    const [log, setLog] = useState('');

    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(args.formID, !!args.formState?.isLoading);
    FormActions.setErrors(args.formID, args.formState?.error as unknown as Errors);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...args}>
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
    formID: ONYXKEYS.FORMS.TEST_FORM,
    submitButtonText: 'Submit',
    validate: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.TEST_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.TEST_FORM> = {};
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
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.TEST_FORM>) => {
        setTimeout(() => {
            alert(`Form submitted!\n\nInput values: ${JSON.stringify(values, null, 4)}`);
            FormActions.setIsLoading(ONYXKEYS.FORMS.TEST_FORM, false);
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
