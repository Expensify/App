import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import DisplayNames from '@components/DisplayNames';
import type DisplayNamesProps from '@components/DisplayNames/types';

type DisplayNamesStory = StoryFn<typeof DisplayNames>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof DisplayNames> = {
    title: 'Typography/DisplayNames',
    component: DisplayNames,
};

function Template(props: DisplayNamesProps) {
    return <DisplayNames {...props} />;
}

const Default: DisplayNamesStory = Template.bind({});
Default.args = {
    fullTitle: 'Alice Johnson',
    numberOfLines: 1,
    tooltipEnabled: false,
};

const WithTooltip: DisplayNamesStory = Template.bind({});
WithTooltip.args = {
    fullTitle: 'Alice Johnson',
    numberOfLines: 1,
    tooltipEnabled: true,
    shouldUseFullTitle: true,
};

const MultipleNames: DisplayNamesStory = Template.bind({});
MultipleNames.args = {
    fullTitle: 'Alice Johnson, Bob Smith',
    numberOfLines: 1,
    tooltipEnabled: true,
    displayNamesWithTooltips: [
        {displayName: 'Alice Johnson', accountID: 1},
        {displayName: 'Bob Smith', accountID: 2},
    ],
};

export default story;
export {Default, WithTooltip, MultipleNames};
