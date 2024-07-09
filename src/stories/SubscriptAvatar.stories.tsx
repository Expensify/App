import type {StoryFn} from '@storybook/react';
import React from 'react';
import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import * as Expensicons from '@components/Icon/Expensicons';
import SubscriptAvatar from '@components/SubscriptAvatar';
import type {SubscriptAvatarProps} from '@components/SubscriptAvatar';
import CONST from '@src/CONST';

type SubscriptAvatarStory = StoryFn<typeof SubscriptAvatar>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/SubscriptAvatar',
    component: SubscriptAvatar,
    args: {
        mainAvatar: {source: defaultAvatars.Avatar5, name: '', type: CONST.ICON_TYPE_AVATAR},
        size: CONST.AVATAR_SIZE.DEFAULT,
    },
    argTypes: {
        size: {
            options: [CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.DEFAULT], // SubscriptAvatar only supports these two sizes
        },
    },
};

function Template(props: SubscriptAvatarProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SubscriptAvatar {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: SubscriptAvatarStory = Template.bind({});

const AvatarURLStory: SubscriptAvatarStory = Template.bind({});
AvatarURLStory.args = {
    mainAvatar: {source: defaultAvatars.Avatar1, name: '', type: CONST.ICON_TYPE_AVATAR},
    secondaryAvatar: {source: defaultAvatars.Avatar3, name: '', type: CONST.ICON_TYPE_AVATAR},
};

const SubscriptIcon: SubscriptAvatarStory = Template.bind({});
SubscriptIcon.args = {
    subscriptIcon: {source: Expensicons.DownArrow, width: 8, height: 8},
};

const WorkspaceSubscriptIcon: SubscriptAvatarStory = Template.bind({});
WorkspaceSubscriptIcon.args = {
    mainAvatar: {source: defaultAvatars.Avatar1, name: '', type: CONST.ICON_TYPE_WORKSPACE},
    subscriptIcon: {source: Expensicons.DownArrow, width: 8, height: 8},
};

export {Default, AvatarURLStory, SubscriptIcon, WorkspaceSubscriptIcon};
