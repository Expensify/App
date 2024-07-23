import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import PromotedActionsBar from '@components/PromotedActionsBar';
import type {PromotedAction, PromotedActionsBarProps} from '@components/PromotedActionsBar';
import variables from '@src/styles/variables';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/PromotedActionsBar',
    component: PromotedActionsBar,
};

type StoryType = typeof Template & {args?: Partial<PromotedActionsBarProps>};

function Template(args: PromotedActionsBarProps) {
    return (
        <View style={{maxWidth: variables.sideBarWidth}}>
            <PromotedActionsBar
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
            />
        </View>
    );
}

const promotedActions = [
    {
        key: 'join',
        icon: Expensicons.CommentBubbles,
        text: 'Join',
        onSelected: () => {},
    },
    {
        key: 'pin',
        icon: Expensicons.Pin,
        text: 'Pin',
        onSelected: () => {},
    },
    {
        key: 'share',
        icon: Expensicons.QrCode,
        text: 'Share',
        onSelected: () => {},
    },
] satisfies PromotedAction[];

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: StoryType = Template.bind({});
Default.args = {
    promotedActions: [promotedActions[0]],
};

const TwoPromotedActions: StoryType = Template.bind({});
TwoPromotedActions.args = {
    promotedActions: [promotedActions[0], promotedActions[1]],
};

const ThreePromotedActions: StoryType = Template.bind({});
ThreePromotedActions.args = {
    promotedActions: [promotedActions[0], promotedActions[1], promotedActions[2]],
};

export default story;
export {Default, TwoPromotedActions, ThreePromotedActions};
