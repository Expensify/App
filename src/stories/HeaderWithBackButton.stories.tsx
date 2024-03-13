import type {ComponentMeta, ComponentStory} from '@storybook/react';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import withNavigationFallback from '@components/withNavigationFallback';

const HeaderWithBackButtonWithNavigation = withNavigationFallback(HeaderWithBackButton);

type HeaderWithBackButtonStory = ComponentStory<typeof HeaderWithBackButtonWithNavigation>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: ComponentMeta<typeof HeaderWithBackButtonWithNavigation> = {
    title: 'Components/HeaderWithBackButton',
    component: HeaderWithBackButtonWithNavigation,
};

function Template(props: HeaderWithBackButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <HeaderWithBackButtonWithNavigation {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: HeaderWithBackButtonStory = Template.bind({});
const Attachment: HeaderWithBackButtonStory = Template.bind({});
const Profile: HeaderWithBackButtonStory = Template.bind({});
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

export default story;
export {Default, Attachment, Profile};
