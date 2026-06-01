import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import SymbolButton from '@components/SymbolButton';

type SymbolButtonStory = StoryFn<typeof SymbolButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SymbolButton> = {
    title: 'Buttons & Actions/SymbolButton',
    component: SymbolButton,
};

function Template(props: React.ComponentProps<typeof SymbolButton>) {
    return <SymbolButton {...props} />;
}

const Default: SymbolButtonStory = Template.bind({});
Default.args = {
    symbol: '$',
    onSymbolButtonPress: () => {},
    isSymbolPressable: true,
};

const NonPressable: SymbolButtonStory = Template.bind({});
NonPressable.args = {
    symbol: '€',
    onSymbolButtonPress: () => {},
    isSymbolPressable: false,
};

export default story;
export {Default, NonPressable};
