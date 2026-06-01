import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import TextBlock from '@components/TextBlock';

type TextBlockStory = StoryFn<typeof TextBlock>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextBlock> = {
    title: 'Typography/TextBlock',
    component: TextBlock,
};

function Template(props: React.ComponentProps<typeof TextBlock>) {
    return <TextBlock {...props} />;
}

const Default: TextBlockStory = Template.bind({});
Default.args = {
    text: 'The quick brown fox jumps over the lazy dog',
};

const WithColor: TextBlockStory = Template.bind({});
WithColor.args = {
    text: 'Colored text block example',
    color: '#00A86B',
};

export default story;
export {Default, WithColor};
