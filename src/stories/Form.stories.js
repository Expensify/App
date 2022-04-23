import React, {useState} from 'react';
import {View} from 'react-native';
import TextInput from '../components/TextInput';
import Picker from '../components/Picker';
import StatePicker from '../components/StatePicker';
import AddressSearch from '../components/AddressSearch';
import Form from '../components/Form';
import * as FormActions from '../libs/actions/FormActions';
import styles from '../styles/styles';
import CheckboxWithLabel from '../components/CheckboxWithLabel';
import Text from '../components/Text';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Form',
    component: Form,
    subcomponents: {
        TextInput,
        AddressSearch,
        CheckboxWithLabel,
        Picker,
    },
};

const Template = (args) => {
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    FormActions.setIsSubmitting(args.formID, args.formState.isSubmitting);
    FormActions.setServerErrorMessage(args.formID, args.formState.serverErrorMessage);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Form {...args}>
            <View>
                <TextInput
                    label="Routing number"
                    inputID="routingNumber"
                    isFormInput
                    shouldSaveDraft
                />
            </View>
            <TextInput
                label="Account number"
                inputID="accountNumber"
                containerStyles={[styles.mt4]}
                isFormInput
            />
            <AddressSearch
                label="Street"
                inputID="street"
                containerStyles={[styles.mt4]}
                isFormInput
            />
            <View>
                <Picker
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
                    isFormInput
                />
            </View>
            <Picker
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
                isFormInput
            />
            <StatePicker
                inputID="pickState"
                containerStyles={[styles.mt4]}
                shouldSaveDraft
                isFormInput
            />
            <CheckboxWithLabel
                inputID="checkbox"
                style={[styles.mb4, styles.mt5]}
                isFormInput
                shouldSaveDraft
                LabelComponent={() => (
                    <Text>I accept the Expensify Terms of Service</Text>
                )}
            />
        </Form>
    );
};

/**
 * Story to exhibit the native event handlers for TextInput in the Form Component
 * @param {Object} args
 * @returns {JSX}
 */
const WithNativeEventHandler = (args) => {
    const [log, setLog] = useState('');

    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    FormActions.setIsSubmitting(args.formID, args.formState.isSubmitting);
    FormActions.setServerErrorMessage(args.formID, args.formState.serverErrorMessage);
    FormActions.setDraftValues(args.formID, args.draftValues);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Form {...args}>
            <TextInput
                label="Routing number"
                inputID="routingNumber"
                onChangeText={setLog}
                isFormInput
                shouldSaveDraft
            />
            <Text>
                {`Entered routing number: ${log}`}
            </Text>
        </Form>
    );
};

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
        if (!values.routingNumber) {
            errors.routingNumber = 'Please enter a routing number';
        }
        if (!values.accountNumber) {
            errors.accountNumber = 'Please enter an account number';
        }
        if (!values.pickFruit) {
            errors.pickFruit = 'Please select a fruit';
        }
        if (!values.pickAnotherFruit) {
            errors.pickAnotherFruit = 'Please select a fruit';
        }
        if (!values.pickState) {
            errors.pickState = 'Please select a state';
        }
        if (!values.checkbox) {
            errors.checkbox = 'You must accept the Terms of Service to continue';
        }
        return errors;
    },
    onSubmit: (values) => {
        setTimeout(() => {
            alert(`Form submitted!\n\nInput values: ${JSON.stringify(values, null, 4)}`);
            FormActions.setIsSubmitting('TestForm', false);
        }, 1000);
    },
    formState: {
        isSubmitting: false,
        serverErrorMessage: '',
    },
    draftValues: {
        routingNumber: '00001',
        accountNumber: '1111222233331111',
        pickFruit: 'orange',
        pickAnotherFruit: 'apple',
        checkbox: false,
    },
};

Default.args = defaultArgs;
Loading.args = {...defaultArgs, formState: {isSubmitting: true}};
ServerError.args = {...defaultArgs, formState: {isSubmitting: false, serverErrorMessage: 'There was an unexpected error. Please try again later.'}};
InputError.args = {
    ...defaultArgs,
    draftValues: {
        routingNumber: '',
        accountNumber: '',
        pickFruit: '',
        pickAnotherFruit: '',
        pickState: '',
        checkbox: false,
    },
};

WithNativeEventHandler.args = {...defaultArgs, draftValues: {routingNumber: '', accountNumber: ''}};

export default story;
export {
    Default,
    Loading,
    ServerError,
    InputError,
    WithNativeEventHandler,
};
