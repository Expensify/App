import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import CONST from '@src/CONST';

type EmptySelectionListContentStory = StoryFn<typeof EmptySelectionListContent>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof EmptySelectionListContent> = {
    title: 'Lists/EmptySelectionListContent',
    component: EmptySelectionListContent,
};

function Template(props: React.ComponentProps<typeof EmptySelectionListContent>) {
    return <EmptySelectionListContent {...props} />;
}

const Create: EmptySelectionListContentStory = Template.bind({});
Create.args = {
    contentType: CONST.IOU.TYPE.CREATE,
};

const Submit: EmptySelectionListContentStory = Template.bind({});
Submit.args = {
    contentType: CONST.IOU.TYPE.SUBMIT,
};

export default story;
export {Create, Submit};
