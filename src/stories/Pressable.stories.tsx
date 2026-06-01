import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import {PressableWithFeedback, PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import CONST from '@src/CONST';

type PressableWithFeedbackStory = StoryFn<typeof PressableWithFeedback>;
type PressableWithoutFeedbackStory = StoryFn<typeof PressableWithoutFeedback>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PressableWithFeedback> = {
    title: 'Buttons & Actions/Pressable',
    component: PressableWithFeedback,
};

function WithFeedbackTemplate(props: React.ComponentProps<typeof PressableWithFeedback>) {
    return (
        <PressableWithFeedback
            sentryLabel="Pressable.Story.WithFeedback"
            {...props}
        >
            <View style={{padding: 12, backgroundColor: '#e0e0e0', borderRadius: 4}}>
                <Text>Press me (with feedback)</Text>
            </View>
        </PressableWithFeedback>
    );
}

function WithoutFeedbackTemplate(props: React.ComponentProps<typeof PressableWithoutFeedback>) {
    return (
        <PressableWithoutFeedback
            sentryLabel="Pressable.Story.WithoutFeedback"
            {...props}
        >
            <View style={{padding: 12, backgroundColor: '#e0e0e0', borderRadius: 4}}>
                <Text>Press me (without feedback)</Text>
            </View>
        </PressableWithoutFeedback>
    );
}

const WithFeedback: PressableWithFeedbackStory = WithFeedbackTemplate.bind({});
WithFeedback.args = {
    accessibilityLabel: 'Press me',
    role: CONST.ROLE.BUTTON,
    onPress: () => {},
};

const WithoutFeedback: PressableWithoutFeedbackStory = WithoutFeedbackTemplate.bind({});
WithoutFeedback.args = {
    accessibilityLabel: 'Press me',
    role: CONST.ROLE.BUTTON,
    onPress: () => {},
};

export default story;
export {WithFeedback, WithoutFeedback};
