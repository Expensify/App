import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';

type AnimatedSubmitButtonStory = StoryFn<typeof AnimatedSubmitButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AnimatedSubmitButton> = {
    title: 'Buttons & Actions/AnimatedSubmitButton',
    component: AnimatedSubmitButton,
};

function Template(props: React.ComponentProps<typeof AnimatedSubmitButton>) {
    return <AnimatedSubmitButton {...props} />;
}

const Default: AnimatedSubmitButtonStory = Template.bind({});
Default.args = {
    text: 'Submit',
    success: true,
    onPress: () => {},
    isSubmittingAnimationRunning: false,
    onAnimationFinish: () => {},
};

const Submitting: AnimatedSubmitButtonStory = Template.bind({});
Submitting.args = {
    text: 'Submit',
    success: true,
    onPress: () => {},
    isSubmittingAnimationRunning: true,
    onAnimationFinish: () => {},
};

export default story;
export {Default, Submitting};
