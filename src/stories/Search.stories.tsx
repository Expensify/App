import React from 'react';
import type {SearchProps} from '@components/Search';
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

type StoryType = typeof Template & {args?: Partial<SearchProps>};

function Template(args: SearchProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Search {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: StoryType = Template.bind({});
Default.args = {
    onPress: () => alert('Pressed'),
};

const CustomPlaceholderAndTooltip: StoryType = Template.bind({});
CustomPlaceholderAndTooltip.args = {
    placeholder: 'Search for a specific thing...',
    tooltip: 'Custom tooltip text',
    onPress: () => alert('This component has custom placeholder text. Also custom tooltip text when hovered.'),
};

const CustomBackground: StoryType = Template.bind({});
CustomBackground.args = {
    onPress: () => alert('This component has custom styles applied'),
    style: {backgroundColor: 'darkgreen'},
};

export default story;
export {Default, CustomPlaceholderAndTooltip, CustomBackground};
