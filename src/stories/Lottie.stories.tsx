import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Lottie from '@components/Lottie';
import DotLottieAnimations from '@components/LottieAnimations';

type LottieStory = StoryFn<typeof Lottie>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Lottie> = {
    title: 'Data Display/Lottie',
    component: Lottie,
};

function Template(props: React.ComponentProps<typeof Lottie>) {
    return <Lottie {...props} />;
}

const Default: LottieStory = Template.bind({});
Default.args = {
    source: DotLottieAnimations.Fireworks,
    autoPlay: true,
    loop: true,
};

const FastMoney: LottieStory = Template.bind({});
FastMoney.args = {
    source: DotLottieAnimations.FastMoney,
    autoPlay: true,
    loop: true,
};

export default story;
export {Default, FastMoney};
