import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import BigNumberPad from '@components/BigNumberPad';

type BigNumberPadStory = StoryFn<typeof BigNumberPad>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof BigNumberPad> = {
    title: 'Forms/BigNumberPad',
    component: BigNumberPad,
};

function Template(props: React.ComponentProps<typeof BigNumberPad>) {
    return <BigNumberPad {...props} />;
}

const Default: BigNumberPadStory = Template.bind({});
Default.args = {
    numberPressed: () => {},
};

export default story;
export {Default};
