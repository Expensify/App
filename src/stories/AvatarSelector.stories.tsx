/* eslint-disable react/jsx-props-no-spreading */
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import type {AvatarSelectorProps} from '@components/AvatarSelector';
import AvatarSelector from '@components/AvatarSelector';
import CONST from '@src/CONST';

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

    // eslint-disable-next-line react/jsx-props-no-spreading
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
    name: 'A',
};

const WithPreselectedAvatar: AvatarSelectorStory = Template.bind({});
WithPreselectedAvatar.args = {
    selectedID: 'default-avatar_3',
    label: 'With preselected avatar',
    name: 'A',
};

const WithPreselectedLetterAvatar: AvatarSelectorStory = Template.bind({});
WithPreselectedLetterAvatar.args = {
    selectedID: 'letter-avatar-#B0D9FF-#0164BF-A',
    label: 'With preselected avatar',
    name: 'A',
};

const LargeAvatars: AvatarSelectorStory = Template.bind({});
LargeAvatars.args = {
    selectedID: 'helmet-blue400',
    size: CONST.AVATAR_SIZE.LARGE,
    label: 'Large avatars',
    name: 'A',
};

const SmallAvatars: AvatarSelectorStory = Template.bind({});
SmallAvatars.args = {
    size: CONST.AVATAR_SIZE.SMALL,
    label: 'Small avatars',
    name: 'A',
};

export default story;
export {Default, WithPreselectedAvatar, WithPreselectedLetterAvatar, LargeAvatars, SmallAvatars};
