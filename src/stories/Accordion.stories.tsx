import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import Accordion from '@components/Accordion';
import Button from '@components/Button';
import Text from '@components/Text';

type AccordionStory = StoryFn<typeof Accordion>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Accordion> = {
    title: 'Layout/Accordion',
    component: Accordion,
};

function DefaultTemplate() {
    const isExpanded = useSharedValue(false);
    const isToggleTriggered = useSharedValue(false);
    const [label, setLabel] = useState('Expand');

    const toggle = () => {
        isToggleTriggered.set(true);
        isExpanded.set(!isExpanded.get());
        setLabel((prev) => (prev === 'Expand' ? 'Collapse' : 'Expand'));
    };

    return (
        <View>
            <Button
                text={label}
                onPress={toggle}
            />
            <Accordion
                isExpanded={isExpanded}
                isToggleTriggered={isToggleTriggered}
            >
                <Text>This content animates in and out when toggled.</Text>
            </Accordion>
        </View>
    );
}

const Default: AccordionStory = DefaultTemplate.bind({});

export default story;
export {Default};
