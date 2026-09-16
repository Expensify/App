import type {UserInitialsAvatarProps} from '@components/UserInitialsAvatar';
import UserInitialsAvatar from '@components/UserInitialsAvatar';

import {DEFAULT_LETTER_AVATAR_SCHEME, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

const SAMPLE_COLORS = [LETTER_AVATAR_SCHEMES.blue100, LETTER_AVATAR_SCHEMES.green400, LETTER_AVATAR_SCHEMES.pink700];

type UserInitialsAvatarStory = StoryFn<typeof UserInitialsAvatar>;

const story: Meta<typeof UserInitialsAvatar> = {
    title: 'Components/UserInitialsAvatar',
    component: UserInitialsAvatar,
};

function Template(props: UserInitialsAvatarProps) {
    return (
        <View style={{flexDirection: 'row', gap: 16, padding: 10}}>
            {SAMPLE_COLORS.map((colors) => (
                <UserInitialsAvatar
                    key={colors.backgroundColor}
                    text={props.text}
                    colors={colors}
                    size={props.size}
                />
            ))}
        </View>
    );
}

const Default: UserInitialsAvatarStory = Template.bind({});
Default.args = {
    text: 'JD',
    colors: DEFAULT_LETTER_AVATAR_SCHEME,
    size: 40,
};

const Large: UserInitialsAvatarStory = Template.bind({});
Large.args = {
    text: 'AB',
    colors: DEFAULT_LETTER_AVATAR_SCHEME,
    size: 80,
};

const SingleLetter: UserInitialsAvatarStory = Template.bind({});
SingleLetter.args = {
    text: 'C',
    colors: DEFAULT_LETTER_AVATAR_SCHEME,
    size: 80,
};

export default story;
export {Default, Large, SingleLetter};
