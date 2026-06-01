import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import PulsingView from '@components/PulsingView';

type PulsingViewStory = StoryFn<typeof PulsingView>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PulsingView> = {
    title: 'Feedback/PulsingView',
    component: PulsingView,
};

function Template(props: React.ComponentProps<typeof PulsingView>) {
    return <PulsingView {...props} />;
}

const Pulsing: PulsingViewStory = Template.bind({});
Pulsing.args = {
    shouldPulse: true,
    minOpacity: 0.3,
    children: <View style={{width: 120, height: 40, backgroundColor: '#0185FF', borderRadius: 8}} />,
};

const Static: PulsingViewStory = Template.bind({});
Static.args = {
    shouldPulse: false,
    children: <View style={{width: 120, height: 40, backgroundColor: '#03D47C', borderRadius: 8}} />,
};

export default story;
export {Pulsing, Static};
