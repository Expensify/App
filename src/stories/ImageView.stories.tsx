import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import ImageView from '@components/ImageView';

type ImageViewStory = StoryFn<typeof ImageView>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ImageView> = {
    title: 'Data Display/ImageView',
    component: ImageView,
};

function Template(props: React.ComponentProps<typeof ImageView>) {
    return (
        <View style={{width: 400, height: 300}}>
            <ImageView {...props} />
        </View>
    );
}

const Default: ImageViewStory = Template.bind({});
Default.args = {
    url: 'https://picsum.photos/400/300',
    fileName: 'sample-image.jpg',
    isAuthTokenRequired: false,
};

export default story;
export {Default};
