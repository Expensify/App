import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import CONST from '@src/CONST';

type FloatingActionButtonStory = StoryFn<typeof FloatingActionButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FloatingActionButton> = {
    title: 'Buttons & Actions/FloatingActionButton',
    component: FloatingActionButton,
};

function Template(props: React.ComponentProps<typeof FloatingActionButton>) {
    return <FloatingActionButton {...props} />;
}

const Default: FloatingActionButtonStory = Template.bind({});
Default.args = {
    isActive: false,
    onPress: () => {},
    accessibilityLabel: 'Create',
    role: CONST.ROLE.BUTTON,
};

const Active: FloatingActionButtonStory = Template.bind({});
Active.args = {
    isActive: true,
    onPress: () => {},
    accessibilityLabel: 'Create',
    role: CONST.ROLE.BUTTON,
};

export default story;
export {Default, Active};
