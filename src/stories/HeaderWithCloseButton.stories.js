import React from 'react';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/HeaderWithCloseButton',
    component: HeaderWithCloseButton,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <HeaderWithCloseButton {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = Template.bind({});
export const Attachment = Template.bind({});
export const Profile = Template.bind({});
Default.args = {
    title: 'Settings',
};
Attachment.args = {
    title: 'Attachment',
    shouldShowDownloadButton: true,
};
Profile.args = {
    title: 'Profile',
    shouldShowBackButton: true,
};
