import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import PinButton from '@components/PinButton';
import type {Report} from '@src/types/onyx';

type PinButtonStory = StoryFn<typeof PinButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PinButton> = {
    title: 'Buttons & Actions/PinButton',
    component: PinButton,
};

const mockReport: Report = {
    reportID: '1',
    isPinned: false,
};

function Template(props: React.ComponentProps<typeof PinButton>) {
    return <PinButton {...props} />;
}

const Default: PinButtonStory = Template.bind({});
Default.args = {
    report: mockReport,
};

const Pinned: PinButtonStory = Template.bind({});
Pinned.args = {
    report: {...mockReport, isPinned: true},
};

export default story;
export {Default, Pinned};
