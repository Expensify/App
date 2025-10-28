/* eslint-disable react/jsx-props-no-spreading */
import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {View} from 'react-native';
import type {AvatarProps} from '@components/Avatar';
import Avatar from '@components/Avatar';
import * as Expensicons from '@components/Icon/Expensicons';
import {ALL_CUSTOM_AVATARS} from '@libs/Avatars/CustomAvatarCatalog';
import CONST from '@src/CONST';

const AVATAR_URL = ALL_CUSTOM_AVATARS['car-blue100'].url;

type AvatarStory = StoryFn<typeof Avatar>;

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

const Default: AvatarStory = Template.bind({});
Default.args = {
    type: CONST.ICON_TYPE_AVATAR,
    source: AVATAR_URL,
    name: 'John Doe',
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const WorkspaceAvatar: AvatarStory = Template.bind({});
WorkspaceAvatar.args = {
    type: CONST.ICON_TYPE_WORKSPACE,
    name: 'Cathy’s Croissants',
    avatarID: 'policy_123',
    size: CONST.AVATAR_SIZE.LARGE,
};

const FallbackAvatar: AvatarStory = Template.bind({});
FallbackAvatar.args = {
    type: CONST.ICON_TYPE_AVATAR,
    fallbackIcon: Expensicons.FallbackAvatar,
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
export {Default, WorkspaceAvatar, FallbackAvatar, SmallAvatar};
