import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import EnvironmentBadge from '@components/EnvironmentBadge';

type EnvironmentBadgeStory = StoryFn<typeof EnvironmentBadge>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 *
 * Note: EnvironmentBadge renders nothing on production. It shows the current
 * environment (e.g. DEV) based on the EnvironmentProvider supplied globally in preview.tsx.
 */
const story: Meta<typeof EnvironmentBadge> = {
    title: 'Data Display/EnvironmentBadge',
    component: EnvironmentBadge,
};

function Template() {
    return <EnvironmentBadge />;
}

const Default: EnvironmentBadgeStory = Template.bind({});

export default story;
export {Default};
