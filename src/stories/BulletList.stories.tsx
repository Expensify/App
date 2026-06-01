import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import BulletList from '@components/BulletList';

type BulletListStory = StoryFn<typeof BulletList>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof BulletList> = {
    title: 'Typography/BulletList',
    component: BulletList,
};

function Template(props: React.ComponentProps<typeof BulletList>) {
    return <BulletList {...props} />;
}

const Default: BulletListStory = Template.bind({});
Default.args = {
    header: 'Things to remember',
    items: ['Scan your receipts', 'Submit your report', 'Get reimbursed'],
};

export default story;
export {Default};
