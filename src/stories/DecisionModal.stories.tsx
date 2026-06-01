import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import DecisionModal from '@components/DecisionModal';

type DecisionModalStory = StoryFn<typeof DecisionModal>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof DecisionModal> = {
    title: 'Overlays & Menus/DecisionModal',
    component: DecisionModal,
};

function Template(props: React.ComponentProps<typeof DecisionModal>) {
    const [isVisible, setIsVisible] = useState(props.isVisible);
    return (
        <DecisionModal
            {...props}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
            onSecondOptionSubmit={() => setIsVisible(false)}
        />
    );
}

const Default: DecisionModalStory = Template.bind({});
Default.args = {
    isVisible: true,
    title: 'Choose an option',
    prompt: 'Please select one of the following options to continue.',
    firstOptionText: 'Option A',
    secondOptionText: 'Option B',
    isSmallScreenWidth: false,
};

const SmallScreen: DecisionModalStory = Template.bind({});
SmallScreen.args = {
    isVisible: true,
    title: 'Choose an option',
    prompt: 'Please select one of the following options to continue.',
    firstOptionText: 'Option A',
    secondOptionText: 'Option B',
    isSmallScreenWidth: true,
};

export default story;
export {Default, SmallScreen};
