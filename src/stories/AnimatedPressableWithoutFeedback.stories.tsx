import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import AnimatedPressableWithoutFeedback from '@components/AnimatedPressableWithoutFeedback';
import Text from '@components/Text';
import CONST from '@src/CONST';

type AnimatedPressableWithoutFeedbackStory = StoryFn<typeof AnimatedPressableWithoutFeedback>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AnimatedPressableWithoutFeedback> = {
    title: 'Buttons & Actions/AnimatedPressableWithoutFeedback',
    component: AnimatedPressableWithoutFeedback,
};

function Template(props: React.ComponentProps<typeof AnimatedPressableWithoutFeedback>) {
    return (
        <AnimatedPressableWithoutFeedback {...props}>
            <View style={{padding: 12, backgroundColor: '#e0e0e0', borderRadius: 4}}>
                <Text>Animated pressable</Text>
            </View>
        </AnimatedPressableWithoutFeedback>
    );
}

const Default: AnimatedPressableWithoutFeedbackStory = Template.bind({});
Default.args = {
    accessibilityLabel: 'Animated pressable',
    role: CONST.ROLE.BUTTON,
    onPress: () => {},
};

export default story;
export {Default};
