import React from 'react';
import ExpensifyButton from '../components/ExpensifyButton';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ExpensifyButton',
    component: ExpensifyButton,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <ExpensifyButton {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const Loading = Template.bind({});
Default.args = {
    text: 'Save & Continue',
    success: true,
};
Loading.args = {
    text: 'Save & Continue',
    isLoading: true,
    success: true,
};

export default story;
export {
    Default,
    Loading,
};
