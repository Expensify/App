import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import type {TextProps} from '@components/Text';
import Text from '@components/Text';

type TextStory = StoryFn<typeof Text>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Text> = {
    title: 'Typography/Text',
    component: Text,
};

function Template(props: TextProps) {
    return <Text {...props} />;
}

const Default: TextStory = Template.bind({});
Default.args = {
    children: 'The quick brown fox jumps over the lazy dog',
};

export default story;
export {Default};
