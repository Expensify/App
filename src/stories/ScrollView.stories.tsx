import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

type ScrollViewStory = StoryFn<typeof ScrollView>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ScrollView> = {
    title: 'Layout/ScrollView',
    component: ScrollView,
};

function Template(props: React.ComponentProps<typeof ScrollView>) {
    return (
        <ScrollView
            {...props}
            style={{maxHeight: 200}}
        >
            {Array.from({length: 20}, (_, i) => (
                <Text key={i}>{`Line ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}</Text>
            ))}
        </ScrollView>
    );
}

const Default: ScrollViewStory = Template.bind({});
Default.args = {};

export default story;
export {Default};
