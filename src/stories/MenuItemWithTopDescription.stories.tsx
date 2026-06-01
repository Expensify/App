import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

type MenuItemWithTopDescriptionStory = StoryFn<typeof MenuItemWithTopDescription>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof MenuItemWithTopDescription> = {
    title: 'Overlays & Menus/MenuItemWithTopDescription',
    component: MenuItemWithTopDescription,
};

function Template(props: React.ComponentProps<typeof MenuItemWithTopDescription>) {
    return <MenuItemWithTopDescription {...props} />;
}

const Default: MenuItemWithTopDescriptionStory = Template.bind({});
Default.args = {
    title: 'United States',
    description: 'Currency',
};

const WithRightIcon: MenuItemWithTopDescriptionStory = Template.bind({});
WithRightIcon.args = {
    title: 'September 1, 2025',
    description: 'Date',
    shouldShowRightIcon: true,
};

const Highlighted: MenuItemWithTopDescriptionStory = Template.bind({});
Highlighted.args = {
    title: 'Acme Corp',
    description: 'Workspace',
    highlighted: true,
    shouldShowRightIcon: true,
};

export default story;
export {Default, WithRightIcon, Highlighted};
