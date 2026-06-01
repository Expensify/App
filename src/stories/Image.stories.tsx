import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Image from '@components/Image';
import {PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';

type ImageStory = StoryFn<typeof Image>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Image> = {
    title: 'Data Display/Image',
    component: Image,
};

function Template(props: React.ComponentProps<typeof Image>) {
    return (
        // eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- the design-system Image type does not expose the accessibilityIgnoresInvertColors prop
        <Image
            style={{width: 80, height: 80, borderRadius: 40}}
            {...props}
        />
    );
}

const Default: ImageStory = Template.bind({});
Default.args = {
    source: {uri: PRESET_AVATAR_CATALOG['car-blue100'].url},
    isAuthTokenRequired: false,
};

export default story;
export {Default};
