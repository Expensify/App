import React from 'react';
import Search from '@components/Search';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Search',
    component: Search,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Search {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    prompt: 'Search...',
    onPress: () => alert('Pressed'),
};

const CustomPromptAndTooltip = Template.bind({});
CustomPromptAndTooltip.args = {
    prompt: 'Search for something...',
    tooltip: 'Custom tooltip text',
    onPress: () => alert('This component has custom prompt text. Also custom tooltip text when hovered.'),
};

const CustomBackground = Template.bind({});
CustomBackground.args = {
    prompt: 'Search...',
    onPress: () => alert('This component has custom styles applied'),
    style: { backgroundColor: '#07271F' },
};

export default story;
export {Default, CustomPromptAndTooltip, CustomBackground};
