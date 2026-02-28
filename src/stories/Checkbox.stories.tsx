import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Checkbox from '@components/Checkbox';
import type {CheckboxProps} from '@components/Checkbox';

type CheckboxStory = StoryFn<typeof Checkbox>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Checkbox> = {
    title: 'Components/Checkbox',
    component: Checkbox,
};

function Template(props: CheckboxProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Checkbox {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: CheckboxStory = Template.bind({});
Default.args = {
    onPress: () => {},
    isChecked: true,
    accessibilityLabel: '',
};

export default story;
export {Default};
