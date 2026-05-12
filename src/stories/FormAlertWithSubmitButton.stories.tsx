import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {FormAlertWithSubmitButtonProps} from '@components/FormAlertWithSubmitButton';

type FormAlertWithSubmitButtonStory = StoryFn<typeof FormAlertWithSubmitButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FormAlertWithSubmitButton> = {
    title: 'Components/FormAlertWithSubmitButton',
    component: FormAlertWithSubmitButton,
};

function Template(props: FormAlertWithSubmitButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <FormAlertWithSubmitButton {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: FormAlertWithSubmitButtonStory = Template.bind({});
const HtmlError: FormAlertWithSubmitButtonStory = Template.bind({});

const defaultArgs: FormAlertWithSubmitButtonStory['args'] = {
    isAlertVisible: true,
    onSubmit: () => {},
    buttonText: 'Submit',
};

Default.args = defaultArgs;
const html = '<em>This is</em> a <strong>test</strong>. None of <h1>these strings</h1> should display <del>as</del> <div>HTML</div>.';
HtmlError.args = {...defaultArgs, isMessageHtml: true, message: html};

export default story;
export {Default, HtmlError};
