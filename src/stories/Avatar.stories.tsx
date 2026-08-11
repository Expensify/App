import type {AvatarProps} from '@components/Avatar';
import Avatar from '@components/Avatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';

import CONST from '@src/CONST';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

const AVATAR_URL = USER_AVATARS.entries['car-blue100'].url;

type AvatarStory = StoryFn<typeof Avatar>;
type WorkspaceAvatarStoryFn = StoryFn<typeof WorkspaceAvatar>;

const story: Meta<typeof Avatar> = {
    title: 'Components/Avatar',
    component: Avatar,
};

function Template(props: AvatarProps) {
    return (
        <View style={{flexDirection: 'row', padding: 10}}>
            <Avatar {...props} />
        </View>
    );
}

function WorkspaceAvatarTemplate(props: React.ComponentProps<typeof WorkspaceAvatar>) {
    return (
        <View style={{flexDirection: 'row', padding: 10}}>
            <WorkspaceAvatar {...props} />
        </View>
    );
}

const Default: AvatarStory = Template.bind({});
Default.args = {
    type: CONST.ICON_TYPE_AVATAR,
    source: AVATAR_URL,
    name: 'John Doe',
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const WorkspaceAvatarStory: WorkspaceAvatarStoryFn = WorkspaceAvatarTemplate.bind({});
WorkspaceAvatarStory.args = {
    name: 'Cathy’s Croissants',
    avatarID: 'policy_123',
    size: CONST.AVATAR_SIZE.XXX_LARGE,
};

const WorkspaceAvatarWithImageStory: WorkspaceAvatarStoryFn = WorkspaceAvatarTemplate.bind({});
WorkspaceAvatarWithImageStory.args = {
    name: 'Cathy’s Croissants',
    avatarID: 'policy_123',
    size: CONST.AVATAR_SIZE.LARGE,
    source: AVATAR_URL,
};

const FallbackAvatar: AvatarStory = Template.bind({});
FallbackAvatar.args = {
    type: CONST.ICON_TYPE_AVATAR,
    fallbackIcon: getExpensifyIcon('FallbackAvatar'),
    name: 'Offline User',
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const SmallAvatar: AvatarStory = Template.bind({});
SmallAvatar.args = {
    type: CONST.ICON_TYPE_AVATAR,
    source: AVATAR_URL,
    name: 'Jane',
    size: CONST.AVATAR_SIZE.SMALL,
};

export default story;
export {Default, WorkspaceAvatarStory as WorkspaceAvatar, WorkspaceAvatarWithImageStory as WorkspaceAvatarWithImage, FallbackAvatar, SmallAvatar};
