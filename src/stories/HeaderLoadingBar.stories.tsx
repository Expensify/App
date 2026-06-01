import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import HeaderLoadingBar from '@components/HeaderLoadingBar';

type HeaderLoadingBarStory = StoryFn<typeof HeaderLoadingBar>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof HeaderLoadingBar> = {
    title: 'Feedback/HeaderLoadingBar',
    component: HeaderLoadingBar,
};

function Template() {
    return <HeaderLoadingBar />;
}

const Default: HeaderLoadingBarStory = Template.bind({});

export default story;
export {Default};
