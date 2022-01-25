import React from 'react';
import TextInput from '../components/TextInput';
import Form from '../components/Form';
import _ from 'underscore';

// 
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Form',
    component: Form,
    subcomponents: {TextInput}
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => (
    <Form {...args}>
        <TextInput
            label={'Routing number'}
            inputID={'routingNumber'}
            isFormInput
            shouldSaveDraft
        />
        <TextInput
            label={'Account number'}
            inputID={'accountNumber'}
            isFormInput
            shouldSaveDraft
        />
    </Form>
);

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const Default = Template.bind({});
Default.args = {
    formID: 'TestForm',
    submitButtonText: 'Submit',
    validate: () => true,
    onSubmit: () => true,
    formState: {
        isSubmitting: false,
        serverErrorMessage: '',
    },
    draftValues: {
        routingNumber: '00001',
        accountNumber: '1111222233331111',
    },
};

export default story;
export {
    Default,
};
