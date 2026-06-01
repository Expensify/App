import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';

type FocusableMenuItemStory = StoryFn<typeof FocusableMenuItem>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FocusableMenuItem> = {
    title: 'Overlays & Menus/FocusableMenuItem',
    component: FocusableMenuItem,
};

function Template(props: React.ComponentProps<typeof FocusableMenuItem>) {
    return <FocusableMenuItem {...props} />;
}

const Default: FocusableMenuItemStory = Template.bind({});
Default.args = {
    title: 'Settings',
    shouldShowRightIcon: true,
};

const Focused: FocusableMenuItemStory = Template.bind({});
Focused.args = {
    title: 'Settings',
    shouldShowRightIcon: true,
    focused: true,
};

export default story;
export {Default, Focused};
