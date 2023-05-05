import React from 'react';
import SubscriptAvatar from '../components/SubscriptAvatar';
import * as defaultWorkspaceAvatars from '../components/Icon/WorkspaceDefaultAvatars';
import * as defaultAvatars from '../components/Icon/DefaultAvatars';
import CONST from '../CONST';

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
        secondaryAvatar: {source: defaultWorkspaceAvatars.WorkspaceE, name: '', type: CONST.ICON_TYPE_WORKSPACE},
        size: CONST.AVATAR_SIZE.DEFAULT,
    },
    argTypes: {
        size: {
            options: [CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.DEFAULT], // SubscriptAvatar only supports these two sizes
        },
    },
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <SubscriptAvatar {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

const AvatarURLStory = Template.bind({});
AvatarURLStory.args = {
    mainAvatar: {source: defaultAvatars.Avatar1, name: '', type: CONST.ICON_TYPE_AVATAR},
    secondaryAvatar: {source: defaultAvatars.Avatar3, name: '', type: CONST.ICON_TYPE_AVATAR},
};

export {
    Default,
    AvatarURLStory,
};
