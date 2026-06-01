import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import CONST from '@src/CONST';

type ThreeDotsMenuStory = StoryFn<typeof ThreeDotsMenu>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ThreeDotsMenu> = {
    title: 'Buttons & Actions/ThreeDotsMenu',
    component: ThreeDotsMenu,
};

function Template(props: React.ComponentProps<typeof ThreeDotsMenu>) {
    return <ThreeDotsMenu {...props} />;
}

const Default: ThreeDotsMenuStory = Template.bind({});
Default.args = {
    shouldSelfPosition: true,
    sentryLabel: CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_THREE_DOT_MENU,
    menuItems: [
        {text: 'Edit', onSelected: () => {}},
        {text: 'Delete', onSelected: () => {}},
    ],
};

export default story;
export {Default};
