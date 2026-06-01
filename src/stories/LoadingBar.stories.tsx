import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import LoadingBar from '@components/LoadingBar';

type LoadingBarStory = StoryFn<typeof LoadingBar>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof LoadingBar> = {
    title: 'Feedback/LoadingBar',
    component: LoadingBar,
};

function Template(props: React.ComponentProps<typeof LoadingBar>) {
    return <LoadingBar {...props} />;
}

const Visible: LoadingBarStory = Template.bind({});
Visible.args = {
    shouldShow: true,
};

const Hidden: LoadingBarStory = Template.bind({});
Hidden.args = {
    shouldShow: false,
};

export default story;
export {Visible, Hidden};
