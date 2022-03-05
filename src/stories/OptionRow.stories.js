import React, {useState} from 'react';
import OptionRow from '../components/OptionRow';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/OptionRow',
    component: OptionRow,
    args: {
    },
};

const Template = (args) => {
    return (
        <OptionRow {...args} />
    );
};

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

export {
    Default,
};
