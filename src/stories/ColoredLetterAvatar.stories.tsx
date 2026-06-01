import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ColoredLetterAvatar from '@components/ColoredLetterAvatar';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import CONST from '@src/CONST';

type ColoredLetterAvatarStory = StoryFn<typeof ColoredLetterAvatar>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ColoredLetterAvatar> = {
    title: 'Data Display/ColoredLetterAvatar',
    component: ColoredLetterAvatar,
};

function Template(props: React.ComponentProps<typeof ColoredLetterAvatar>) {
    return <ColoredLetterAvatar {...props} />;
}

const Default: ColoredLetterAvatarStory = Template.bind({});
Default.args = {
    component: getExpensifyIcon('User'),
    backgroundColor: '#0185FF',
    fillColor: '#FFFFFF',
    size: CONST.AVATAR_SIZE.MEDIUM,
};

const Large: ColoredLetterAvatarStory = Template.bind({});
Large.args = {
    component: getExpensifyIcon('User'),
    backgroundColor: '#03D47C',
    fillColor: '#FFFFFF',
    size: CONST.AVATAR_SIZE.LARGE,
};

export default story;
export {Default, Large};
