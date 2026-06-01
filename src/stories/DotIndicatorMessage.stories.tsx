import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import DotIndicatorMessage from '@components/DotIndicatorMessage';

type DotIndicatorMessageStory = StoryFn<typeof DotIndicatorMessage>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof DotIndicatorMessage> = {
    title: 'Feedback/DotIndicatorMessage',
    component: DotIndicatorMessage,
};

function Template(props: React.ComponentProps<typeof DotIndicatorMessage>) {
    return <DotIndicatorMessage {...props} />;
}

const Error: DotIndicatorMessageStory = Template.bind({});
Error.args = {
    type: 'error',
    messages: {message: 'Something went wrong. Please try again.'},
};

const Success: DotIndicatorMessageStory = Template.bind({});
Success.args = {
    type: 'success',
    messages: {message: 'Your changes were saved.'},
};

export default story;
export {Error, Success};
