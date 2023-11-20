import React, {useState} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Picker from '@components/Picker';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import NetworkConnection from '@libs/NetworkConnection';
import * as ValidationUtils from '@libs/ValidationUtils';
import styles from '@styles/styles';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
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

function Template(args) {
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(args.formID, args.formState.isLoading);
    FormActions.setErrors(args.formID, args.formState.error);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...args}>
            <View>
                <InputWrapper
                    InputComponent={TextInput}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    accessibilityLabel="Routing number"
                    label="Routing number"
                    inputID="routingNumber"
                    shouldSaveDraft
                />
            </View>
            <InputWrapper
                InputComponent={TextInput}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                label="Account number"
                accessibilityLabel="Account number"
                inputID="accountNumber"
                containerStyles={[styles.mt4]}
            />
            <InputWrapper
                InputComponent={AddressSearch}
                label="Street"
                inputID="street"
                containerStyles={[styles.mt4]}
                hint="No PO box"
            />
            <InputWrapper
                InputComponent={DatePicker}
                label="Date of birth"
                inputID="dob"
                containerStyles={[styles.mt4]}
            />
            <View>
                <InputWrapper
                    InputComponent={Picker}
                    label="Fruit"
                    inputID="pickFruit"
                    containerStyles={[styles.mt4]}
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
                containerStyles={[styles.mt4]}
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
            <View style={styles.mt4}>
                <InputWrapper
                    InputComponent={StatePicker}
                    inputID="state"
                    shouldSaveDraft
                />
            </View>
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                inputID="checkbox"
                style={[styles.mb4, styles.mt5]}
                LabelComponent={() => <Text>I accept the Expensify Terms of Service</Text>}
            />
        </FormProvider>
    );
}

/**
 * Story to exhibit the native event handlers for TextInput in the Form Component
 * @param {Object} args
 * @returns {JSX}
 */
function WithNativeEventHandler(args) {
    const [log, setLog] = useState('');

    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection.setOfflineStatus(false);
    FormActions.setIsLoading(args.formID, args.formState.isLoading);
    FormActions.setErrors(args.formID, args.formState.error);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <FormProvider {...args}>
            <InputWrapper
                InputComponent={TextInput}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
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
const Default = Template.bind({});
const Loading = Template.bind({});
const ServerError = Template.bind({});
const InputError = Template.bind({});

const defaultArgs = {
    formID: 'TestForm',
    submitButtonText: 'Submit',
    validate: (values) => {
        const errors = {};
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
    onSubmit: (values) => {
        setTimeout(() => {
            alert(`Form submitted!\n\nInput values: ${JSON.stringify(values, null, 4)}`);
            FormActions.setIsLoading('TestForm', false);
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
