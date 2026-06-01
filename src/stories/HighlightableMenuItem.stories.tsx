import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import HighlightableMenuItem from '@components/HighlightableMenuItem';

type HighlightableMenuItemStory = StoryFn<typeof HighlightableMenuItem>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof HighlightableMenuItem> = {
    title: 'Overlays & Menus/HighlightableMenuItem',
    component: HighlightableMenuItem,
};

function Template(props: React.ComponentProps<typeof HighlightableMenuItem>) {
    return <HighlightableMenuItem {...props} />;
}

const Default: HighlightableMenuItemStory = Template.bind({});
Default.args = {
    title: 'Workspace Name',
    shouldShowRightIcon: true,
};

const Highlighted: HighlightableMenuItemStory = Template.bind({});
Highlighted.args = {
    title: 'Workspace Name',
    shouldShowRightIcon: true,
    highlighted: true,
};

export default story;
export {Default, Highlighted};
