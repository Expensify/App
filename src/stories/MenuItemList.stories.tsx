import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';

type MenuItemListStory = StoryFn<typeof MenuItemList>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof MenuItemList> = {
    title: 'Overlays & Menus/MenuItemList',
    component: MenuItemList,
};

const sampleItems: MenuItemWithLink[] = [
    {title: 'Profile', key: 'profile', shouldShowRightIcon: true},
    {title: 'Preferences', key: 'preferences', shouldShowRightIcon: true},
    {title: 'Security', key: 'security', shouldShowRightIcon: true},
];

function Template(props: React.ComponentProps<typeof MenuItemList>) {
    return <MenuItemList {...props} />;
}

const Default: MenuItemListStory = Template.bind({});
Default.args = {
    menuItems: sampleItems,
};

const WithLink: MenuItemListStory = Template.bind({});
WithLink.args = {
    menuItems: [
        {title: 'Expensify Website', key: 'website', link: 'https://expensify.com', shouldShowRightIcon: true},
        {title: 'Help Center', key: 'help', link: 'https://help.expensify.com', shouldShowRightIcon: true},
    ],
};

export default story;
export {Default, WithLink};
