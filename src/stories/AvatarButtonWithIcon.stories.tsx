import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import {getExpensifyIcon} from '@components/Icon/chunks/expensify-icons.chunk';
import {PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';
import CONST from '@src/CONST';

type AvatarButtonWithIconStory = StoryFn<typeof AvatarButtonWithIcon>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AvatarButtonWithIcon> = {
    title: 'Data Display/AvatarButtonWithIcon',
    component: AvatarButtonWithIcon,
};

function Template(props: React.ComponentProps<typeof AvatarButtonWithIcon>) {
    return <AvatarButtonWithIcon {...props} />;
}

const Default: AvatarButtonWithIconStory = Template.bind({});
Default.args = {
    text: 'Edit avatar',
    source: PRESET_AVATAR_CATALOG['car-blue100'].url,
    avatarStyle: {width: 80, height: 80, borderRadius: 40},
    size: CONST.AVATAR_SIZE.LARGE,
    type: CONST.ICON_TYPE_AVATAR,
    name: 'John Doe',
    onPress: () => {},
    sentryLabel: CONST.SENTRY_LABEL.PROFILE_PAGE.AVATAR,
};

const WithEditIcon: AvatarButtonWithIconStory = Template.bind({});
WithEditIcon.args = {
    text: 'Edit workspace avatar',
    source: PRESET_AVATAR_CATALOG['car-blue100'].url,
    avatarStyle: {width: 80, height: 80, borderRadius: 40},
    size: CONST.AVATAR_SIZE.LARGE,
    type: CONST.ICON_TYPE_WORKSPACE,
    name: 'My Workspace',
    editIcon: getExpensifyIcon('Pencil'),
    onPress: () => {},
    sentryLabel: CONST.SENTRY_LABEL.PROFILE_PAGE.AVATAR,
};

export default story;
export {Default, WithEditIcon};
