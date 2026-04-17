import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import SelectionButton from '@components/SelectionButton';
import type {SelectionButtonProps} from '@components/SelectionButton';

type SelectionButtonStory = StoryFn<typeof SelectionButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SelectionButton> = {
    title: 'Components/SelectionButton',
    component: SelectionButton,
};

function Template(props: SelectionButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SelectionButton {...props} />;
}

const Default: SelectionButtonStory = Template.bind({});
Default.args = {
    onPress: () => {},
    isChecked: true,
    accessibilityLabel: '',
};

export default story;
export {Default};
