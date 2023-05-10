import React from 'react';
import InlineSystemMessage from '../components/InlineSystemMessage';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/InlineSystemMessage',
    component: InlineSystemMessage,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <InlineSystemMessage {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    message: 'This is an error message',
};

export default story;
export {
    Default,
};
