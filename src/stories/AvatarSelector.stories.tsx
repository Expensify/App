import type {AvatarSelectorProps} from '@components/AvatarSelector';
import AvatarSelector from '@components/AvatarSelector';

import CONST from '@src/CONST';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useState} from 'react';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */

type AvatarSelectorStory = StoryFn<typeof AvatarSelector>;

const story: Meta<typeof AvatarSelector> = {
    title: 'Components/AvatarSelector',
    component: AvatarSelector,
};

function Template(props: AvatarSelectorProps) {
    const [selected, setSelected] = useState(props.selectedID);

    return (
        <AvatarSelector
            {...props}
            selectedID={selected}
            onSelect={setSelected}
        />
    );
}

const Default: AvatarSelectorStory = Template.bind({});
Default.args = {
    selectedID: undefined,
    label: 'Or choose an avatar',
};

const WithPreselectedAvatar: AvatarSelectorStory = Template.bind({});
WithPreselectedAvatar.args = {
    selectedID: 'default-avatar_3',
    label: 'With preselected avatar',
};

const WithPreselectedLetterAvatar: AvatarSelectorStory = Template.bind({});
WithPreselectedLetterAvatar.args = {
    selectedID: 'blue100',
    label: 'With preselected avatar',
};

const LargeAvatars: AvatarSelectorStory = Template.bind({});
LargeAvatars.args = {
    selectedID: 'helmet-blue400',
    size: CONST.AVATAR_SIZE.LARGE,
    label: 'Large avatars',
};

const SmallAvatars: AvatarSelectorStory = Template.bind({});
SmallAvatars.args = {
    size: CONST.AVATAR_SIZE.SMALL,
    label: 'Small avatars',
};

export default story;
export {Default, WithPreselectedAvatar, WithPreselectedLetterAvatar, LargeAvatars, SmallAvatars};
