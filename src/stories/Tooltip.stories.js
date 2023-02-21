import React from 'react';
import Tooltip from '../components/Tooltip';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Tooltip',
    component: Tooltip,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => (
    <div style={{
        width: 100,
    }}
    >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Tooltip {...args} maxWidth={args.maxWidth || undefined} />
    </div>
);

const Children = (
    <div style={{
        width: 100,
        height: 60,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    }}
    >
        Hover me
    </div>
);

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    text: 'Tooltip',
    numberOfLines: 1,
    maxWidth: 0,
    absolute: false,
    children: Children,
};

export default story;
export {
    Default,
};
