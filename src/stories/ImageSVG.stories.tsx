import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import ImageSVG from '@components/ImageSVG';

type ImageSVGStory = StoryFn<typeof ImageSVG>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ImageSVG> = {
    title: 'Data Display/ImageSVG',
    component: ImageSVG,
};

function Template(props: React.ComponentProps<typeof ImageSVG>) {
    return <ImageSVG {...props} />;
}

const Default: ImageSVGStory = Template.bind({});
Default.args = {
    src: getExpensifyIcon('User'),
    width: 40,
    height: 40,
};

const WithFill: ImageSVGStory = Template.bind({});
WithFill.args = {
    src: getExpensifyIcon('Star'),
    width: 64,
    height: 64,
    fill: '#FFD700',
};

export default story;
export {Default, WithFill};
