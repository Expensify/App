import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import SelectionButton from '@components/SelectionButton';
import CONST from '@src/CONST';

type SelectionButtonStory = StoryFn<typeof SelectionButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SelectionButton> = {
    title: 'Forms/SelectionButton',
    component: SelectionButton,
};

function CheckboxTemplate(props: React.ComponentProps<typeof SelectionButton>) {
    const [isChecked, setIsChecked] = useState(props.isChecked ?? false);
    return (
        <SelectionButton
            {...props}
            isChecked={isChecked}
            onPress={() => setIsChecked((prev) => !prev)}
        />
    );
}

function RadioTemplate(props: React.ComponentProps<typeof SelectionButton>) {
    const [isChecked, setIsChecked] = useState(props.isChecked ?? false);
    return (
        <SelectionButton
            {...props}
            isChecked={isChecked}
            onPress={() => setIsChecked((prev) => !prev)}
        />
    );
}

const Checkbox: SelectionButtonStory = CheckboxTemplate.bind({});
Checkbox.args = {
    role: CONST.ROLE.CHECKBOX,
    isChecked: false,
    accessibilityLabel: 'Select item',
};

const Radio: SelectionButtonStory = RadioTemplate.bind({});
Radio.args = {
    role: CONST.ROLE.RADIO,
    isChecked: true,
    accessibilityLabel: 'Select option',
};

export default story;
export {Checkbox, Radio};
