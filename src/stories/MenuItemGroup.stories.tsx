import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import MenuItem from '@components/MenuItem';
import MenuItemGroup from '@components/MenuItemGroup';

type MenuItemGroupStory = StoryFn<typeof MenuItemGroup>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof MenuItemGroup> = {
    title: 'Overlays & Menus/MenuItemGroup',
    component: MenuItemGroup,
};

function Template(props: React.ComponentProps<typeof MenuItemGroup>) {
    return (
        <MenuItemGroup {...props}>
            <MenuItem title="Profile" />
            <MenuItem title="Preferences" />
            <MenuItem title="Security" />
        </MenuItemGroup>
    );
}

const Default: MenuItemGroupStory = Template.bind({});
Default.args = {
    shouldUseSingleExecution: true,
};

export default story;
export {Default};
