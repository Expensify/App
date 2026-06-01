import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ActivityIndicator from '@components/ActivityIndicator';

type ActivityIndicatorStory = StoryFn<typeof ActivityIndicator>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ActivityIndicator> = {
    title: 'Feedback/ActivityIndicator',
    component: ActivityIndicator,
};

function Template(props: React.ComponentProps<typeof ActivityIndicator>) {
    return <ActivityIndicator {...props} />;
}

const Default: ActivityIndicatorStory = Template.bind({});
Default.args = {
    size: 'large',
    reasonAttributes: {context: 'Storybook'},
};

export default story;
export {Default};
