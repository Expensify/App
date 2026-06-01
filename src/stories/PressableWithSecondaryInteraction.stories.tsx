import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import CONST from '@src/CONST';

type PressableWithSecondaryInteractionStory = StoryFn<typeof PressableWithSecondaryInteraction>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PressableWithSecondaryInteraction> = {
    title: 'Buttons & Actions/PressableWithSecondaryInteraction',
    component: PressableWithSecondaryInteraction,
};

function Template(props: React.ComponentProps<typeof PressableWithSecondaryInteraction>) {
    return (
        <PressableWithSecondaryInteraction {...props}>
            <View style={{padding: 12, backgroundColor: '#e0e0e0', borderRadius: 4}}>
                <Text>Press or right-click me</Text>
            </View>
        </PressableWithSecondaryInteraction>
    );
}

const Default: PressableWithSecondaryInteractionStory = Template.bind({});
Default.args = {
    accessibilityLabel: 'Press or right-click me',
    role: CONST.ROLE.BUTTON,
    onPress: () => {},
    onSecondaryInteraction: () => {},
};

export default story;
export {Default};
