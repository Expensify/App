import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import PrevNextButtons from '@components/PrevNextButtons';

type PrevNextButtonsStory = StoryFn<typeof PrevNextButtons>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PrevNextButtons> = {
    title: 'Buttons & Actions/PrevNextButtons',
    component: PrevNextButtons,
};

function Template(props: React.ComponentProps<typeof PrevNextButtons>) {
    return <PrevNextButtons {...props} />;
}

const Default: PrevNextButtonsStory = Template.bind({});
Default.args = {
    onNext: () => {},
    onPrevious: () => {},
};

const WithPrevDisabled: PrevNextButtonsStory = Template.bind({});
WithPrevDisabled.args = {
    onNext: () => {},
    onPrevious: () => {},
    isPrevButtonDisabled: true,
};

export default story;
export {Default, WithPrevDisabled};
