import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';

type HeaderWithBackButtonStory = StoryFn<typeof HeaderWithBackButton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof HeaderWithBackButton> = {
    title: 'Components/HeaderWithBackButton',
    component: HeaderWithBackButton,
};

function Template(props: HeaderWithBackButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <HeaderWithBackButton {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: HeaderWithBackButtonStory = Template.bind({});
const Attachment: HeaderWithBackButtonStory = Template.bind({});
const Profile: HeaderWithBackButtonStory = Template.bind({});
const ProgressBar: HeaderWithBackButtonStory = Template.bind({});
Default.args = {
    title: 'Settings',
};
Attachment.args = {
    title: 'Attachment',
    shouldShowDownloadButton: true,
};
Profile.args = {
    title: 'Profile',
};
ProgressBar.args = {
    title: 'ProgressBar',
    progressBarPercentage: 33,
    shouldShowBackButton: false,
};

export default story;
export {Default, Attachment, Profile, ProgressBar};
