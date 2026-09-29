import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import UserAvatar from '@components/Avatar/UserAvatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';

import CONST from '@src/CONST';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

const AVATAR_URL = USER_AVATARS.entries['car-blue100'].url;

type UserAvatarStory = StoryFn<typeof UserAvatar>;
type WorkspaceAvatarStoryFn = StoryFn<typeof WorkspaceAvatar>;

const story: Meta<typeof UserAvatar> = {
    title: 'Components/Avatar',
    component: UserAvatar,
};

function Template(props: UserAvatarProps) {
    return (
        <View style={{flexDirection: 'row', padding: 10}}>
            <UserAvatar {...props} />
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

const Default: UserAvatarStory = Template.bind({});
Default.args = {
    source: AVATAR_URL,
    accountID: 1,
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

const FallbackAvatar: UserAvatarStory = Template.bind({});
FallbackAvatar.args = {
    fallbackIcon: getExpensifyIcon('FallbackAvatar'),
    accountID: 1,
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const SmallAvatar: UserAvatarStory = Template.bind({});
SmallAvatar.args = {
    source: AVATAR_URL,
    accountID: 1,
    size: CONST.AVATAR_SIZE.SMALL,
};

export default story;
export {Default, WorkspaceAvatarStory as WorkspaceAvatar, WorkspaceAvatarWithImageStory as WorkspaceAvatarWithImage, FallbackAvatar, SmallAvatar};
