import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import SwipeableView from '@components/SwipeableView';
import Text from '@components/Text';

type SwipeableViewStory = StoryFn<typeof SwipeableView>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SwipeableView> = {
    title: 'Layout/SwipeableView',
    component: SwipeableView,
};

function Template(props: React.ComponentProps<typeof SwipeableView>) {
    return (
        <SwipeableView {...props}>
            <Text>Swipe down to dismiss (on native). On web, children render directly.</Text>
        </SwipeableView>
    );
}

const Default: SwipeableViewStory = Template.bind({});
Default.args = {
    onSwipeDown: () => {},
};

export default story;
export {Default};
