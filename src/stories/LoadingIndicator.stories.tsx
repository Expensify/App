import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import LoadingIndicator from '@components/LoadingIndicator';

type LoadingIndicatorStory = StoryFn<typeof LoadingIndicator>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof LoadingIndicator> = {
    title: 'Feedback/LoadingIndicator',
    component: LoadingIndicator,
};

function Template(props: React.ComponentProps<typeof LoadingIndicator>) {
    return <LoadingIndicator {...props} />;
}

const Default: LoadingIndicatorStory = Template.bind({});
Default.args = {};

export default story;
export {Default};
