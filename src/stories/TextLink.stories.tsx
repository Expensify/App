import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import TextLink from '@components/TextLink';

type TextLinkStory = StoryFn<typeof TextLink>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextLink> = {
    title: 'Typography/TextLink',
    component: TextLink,
};

function Template(props: React.ComponentProps<typeof TextLink>) {
    return <TextLink {...props} />;
}

const Default: TextLinkStory = Template.bind({});
Default.args = {
    href: 'https://new.expensify.com',
    children: 'Open New Expensify',
};

export default story;
export {Default};
