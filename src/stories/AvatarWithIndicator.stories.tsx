import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import {PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';

type AvatarWithIndicatorStory = StoryFn<typeof AvatarWithIndicator>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AvatarWithIndicator> = {
    title: 'Data Display/AvatarWithIndicator',
    component: AvatarWithIndicator,
};

function Template(props: React.ComponentProps<typeof AvatarWithIndicator>) {
    return <AvatarWithIndicator {...props} />;
}

const Loading: AvatarWithIndicatorStory = Template.bind({});
Loading.args = {
    isLoading: true,
    tooltipText: 'Loading avatar',
};

const Loaded: AvatarWithIndicatorStory = Template.bind({});
Loaded.args = {
    source: PRESET_AVATAR_CATALOG['car-blue100'].url,
    isLoading: false,
    tooltipText: 'John Doe',
};

export default story;
export {Loading, Loaded};
