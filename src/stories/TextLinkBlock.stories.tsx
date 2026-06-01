import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import TextLinkBlock from '@components/TextLinkBlock';

type TextLinkBlockStory = StoryFn<typeof TextLinkBlock>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextLinkBlock> = {
    title: 'Typography/TextLinkBlock',
    component: TextLinkBlock,
};

function Template(props: React.ComponentProps<typeof TextLinkBlock>) {
    return <TextLinkBlock {...props} />;
}

const Default: TextLinkBlockStory = Template.bind({});
Default.args = {
    text: 'View terms and conditions',
    href: 'https://expensify.com',
};

export default story;
export {Default};
