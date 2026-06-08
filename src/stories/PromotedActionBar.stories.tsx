import React from 'react';
import {View} from 'react-native';
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

type PromotedActionsBarPropsWithText = Omit<PromotedActionsBarProps, 'promotedActions'> & {promotedActions: PromotedAction[]};
type StoryType = typeof Template & {args?: Partial<PromotedActionsBarPropsWithText>};

function Template(args: PromotedActionsBarProps) {
    return (
        <View style={{maxWidth: variables.sideBarWidth}}>
            <PromotedActionsBar {...args} />
        </View>
    );
}

const promotedActions = [
    {
        key: 'join',
        icon: 'CommentBubbles',
        translationKey: 'common.message',
        onSelected: () => {},
    },
    {
        key: 'pin',
        icon: 'Pin',
        translationKey: 'common.pin',
        onSelected: () => {},
    },
    {
        key: 'share',
        icon: 'QrCode',
        translationKey: 'common.share',
        onSelected: () => {},
    },
] satisfies PromotedAction[];

const defaultPromotedAction = {
    key: '',
    icon: 'ChatBubbles',
    translationKey: 'common.join',
    onSelected: () => {},
} satisfies PromotedAction;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: StoryType = Template.bind({});
Default.args = {
    promotedActions: [promotedActions.at(0) ?? defaultPromotedAction],
};

const TwoPromotedActions: StoryType = Template.bind({});
TwoPromotedActions.args = {
    promotedActions: [promotedActions.at(0) ?? defaultPromotedAction, promotedActions.at(1) ?? defaultPromotedAction],
};

const ThreePromotedActions: StoryType = Template.bind({});
ThreePromotedActions.args = {
    promotedActions: [promotedActions.at(0) ?? defaultPromotedAction, promotedActions.at(1) ?? defaultPromotedAction, promotedActions.at(2) ?? defaultPromotedAction],
};

export default story;
export {Default, TwoPromotedActions, ThreePromotedActions};
