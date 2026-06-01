import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import RadioButton from '@components/RadioButton';
import type {RadioButtonProps} from '@components/SelectionButton';

type RadioButtonStory = StoryFn<typeof RadioButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof RadioButton> = {
    title: 'Forms/RadioButton',
    component: RadioButton,
};

function Template(props: RadioButtonProps) {
    const [isChecked, setIsChecked] = useState(props.isChecked);
    return (
        <RadioButton
            {...props}
            isChecked={isChecked}
            onPress={() => setIsChecked((prev) => !prev)}
        />
    );
}

const Default: RadioButtonStory = Template.bind({});
Default.args = {
    isChecked: true,
    accessibilityLabel: 'Select option',
};

export default story;
export {Default};
