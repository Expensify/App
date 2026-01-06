/* eslint-disable react/jsx-props-no-spreading */
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import type {AvatarProps} from '@components/Avatar';
import Avatar from '@components/Avatar';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import {PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';
import CONST from '@src/CONST';

const AVATAR_URL = PRESET_AVATAR_CATALOG['car-blue100'].url;

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
export {Default, WorkspaceAvatar, FallbackAvatar, SmallAvatar};
