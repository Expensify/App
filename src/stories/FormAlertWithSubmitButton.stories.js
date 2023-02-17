import React from 'react';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/FormAlertWithSubmitButton',
    component: FormAlertWithSubmitButton,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <FormAlertWithSubmitButton {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const HtmlError = Template.bind({});

const defaultArgs = {
    isAlertVisible: true,
    onSubmit: () => {},
    buttonText: 'Submit',
    network: {
        isOffline: true,
    },
};

Default.args = defaultArgs;
const html = '<em>This is</em> a <strong>test</strong>. None of <h1>these strings</h1> should display <del>as</del> <div>HTML</div>.';
HtmlError.args = {...defaultArgs, isMessageHtml: true, message: html};

export default story;
export {
    Default,
    HtmlError,
};
