import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {ReportActionItemImageWithAspectRatioProps} from '@components/ReportActionItem/ReportActionItemImageWithAspectRatio';
import ReportActionItemImageWithAspectRatio from '@components/ReportActionItem/ReportActionItemImageWithAspectRatio';
import type {Transaction} from '@src/types/onyx';

type ReportActionItemImageWithAspectRatioStory = StoryFn<typeof ReportActionItemImageWithAspectRatio>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ReportActionItemImageWithAspectRatio> = {
    title: 'Components/ReportActionItemImageWithAspectRatio',
    component: ReportActionItemImageWithAspectRatio,
};

function Template(props: ReportActionItemImageWithAspectRatioProps) {
    return (
        <PressableWithoutFeedback
            accessibilityLabel="ReportActionItemImageWithAspectRatio Story"
            style={{flex: 1}}
        >
            <ReportActionItemImageWithAspectRatio
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </PressableWithoutFeedback>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: ReportActionItemImageWithAspectRatioStory = Template.bind({});
const image = {
    image: 'eReceipt/FAKE_3',
    thumbnail: '',
    transaction: {
        transactionID: 'FAKE_3',
        amount: 1000,
        currency: 'USD',
        cardID: 5,
        merchant: 'United Airlines',
        mccGroup: 'Commuter',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
        comment: {attendees: [{email: 'test@expensify.com', displayName: 'Test User', avatarUrl: ''}]},
        reportID: 'REPORT_1',
    } as Transaction,
};

Default.args = {
    image,
};

const WithAspectRatio: ReportActionItemImageWithAspectRatioStory = Template.bind({});
WithAspectRatio.args = {
    image,
    shouldUseAspectRatio: true,
};

export default story;
export {Default, WithAspectRatio};
