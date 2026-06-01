import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import UnreadActionIndicator from '@components/UnreadActionIndicator';

type UnreadActionIndicatorStory = StoryFn<typeof UnreadActionIndicator>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof UnreadActionIndicator> = {
    title: 'Feedback/UnreadActionIndicator',
    component: UnreadActionIndicator,
};

function Template(props: React.ComponentProps<typeof UnreadActionIndicator>) {
    return <UnreadActionIndicator {...props} />;
}

const Default: UnreadActionIndicatorStory = Template.bind({});
Default.args = {
    reportActionID: 'storybook-action-id',
    shouldHideThreadDividerLine: false,
};

const HiddenDivider: UnreadActionIndicatorStory = Template.bind({});
HiddenDivider.args = {
    reportActionID: 'storybook-action-id-2',
    shouldHideThreadDividerLine: true,
};

export default story;
export {Default, HiddenDivider};
