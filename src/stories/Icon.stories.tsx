import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Icon from '@components/Icon';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import variables from '@styles/variables';

type IconStory = StoryFn<typeof Icon>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Icon> = {
    title: 'Data Display/Icon',
    component: Icon,
};

function Template(props: React.ComponentProps<typeof Icon>) {
    return <Icon {...props} />;
}

const Default: IconStory = Template.bind({});
Default.args = {
    src: getExpensifyIcon('User'),
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
};

const Small: IconStory = Template.bind({});
Small.args = {
    src: getExpensifyIcon('Star'),
    small: true,
};

const Large: IconStory = Template.bind({});
Large.args = {
    src: getExpensifyIcon('Home'),
    large: true,
    fill: '#0185FF',
};

export default story;
export {Default, Small, Large};
