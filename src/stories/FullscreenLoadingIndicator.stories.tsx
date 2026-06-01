import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import CONST from '@src/CONST';

type FullscreenLoadingIndicatorStory = StoryFn<typeof FullscreenLoadingIndicator>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FullscreenLoadingIndicator> = {
    title: 'Feedback/FullscreenLoadingIndicator',
    component: FullscreenLoadingIndicator,
};

function Template(props: React.ComponentProps<typeof FullscreenLoadingIndicator>) {
    return <FullscreenLoadingIndicator {...props} />;
}

const Default: FullscreenLoadingIndicatorStory = Template.bind({});
Default.args = {
    iconSize: CONST.ACTIVITY_INDICATOR_SIZE.LARGE,
    reasonAttributes: {context: 'Storybook'},
};

const Small: FullscreenLoadingIndicatorStory = Template.bind({});
Small.args = {
    iconSize: CONST.ACTIVITY_INDICATOR_SIZE.SMALL,
    reasonAttributes: {context: 'Storybook'},
};

export default story;
export {Default, Small};
