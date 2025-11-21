import React from 'react';
import {View} from 'react-native';
import PromotedActionsBar from '@components/PromotedActionsBar';
import type {PromotedAction, PromotedActionsBarProps} from '@components/PromotedActionsBar';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

type PromotedActionWithText = Omit<PromotedAction, 'translationKey'> & {text: string};
type PromotedActionsBarPropsWithText = Omit<PromotedActionsBarProps, 'promotedActions'> & {promotedActions: PromotedActionWithText[]};
type StoryType = typeof Template & {args?: Partial<PromotedActionsBarPropsWithText>};

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

// Helper function to get promotedActions and defaultPromotedAction with lazy loaded icons
function createPromotedActionsData() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CommentBubbles', 'Pin', 'QrCode', 'ExpensifyLogoNew'] as const);

    const promotedActions = [
        {
            key: 'join',
            icon: expensifyIcons.CommentBubbles,
            text: 'Join',
            onSelected: () => {},
        },
        {
            key: 'pin',
            icon: expensifyIcons.Pin,
            text: 'Pin',
            onSelected: () => {},
        },
        {
            key: 'share',
            icon: expensifyIcons.QrCode,
            text: 'Share',
            onSelected: () => {},
        },
    ] satisfies PromotedActionWithText[];

    const defaultPromotedAction = {
        key: '',
        icon: expensifyIcons.ExpensifyLogoNew,
        text: '',
        onSelected: () => {},
    };

    return {promotedActions, defaultPromotedAction};
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: StoryType = Template.bind({});
Default.args = {
    promotedActions: (() => {
        const {promotedActions, defaultPromotedAction} = createPromotedActionsData();
        return [promotedActions.at(0) ?? defaultPromotedAction];
    })(),
};

const TwoPromotedActions: StoryType = Template.bind({});
TwoPromotedActions.args = {
    promotedActions: (() => {
        const {promotedActions, defaultPromotedAction} = createPromotedActionsData();
        return [promotedActions.at(0) ?? defaultPromotedAction, promotedActions.at(1) ?? defaultPromotedAction];
    })(),
};

const ThreePromotedActions: StoryType = Template.bind({});
ThreePromotedActions.args = {
    promotedActions: (() => {
        const {promotedActions, defaultPromotedAction} = createPromotedActionsData();
        return [promotedActions.at(0) ?? defaultPromotedAction, promotedActions.at(1) ?? defaultPromotedAction, promotedActions.at(2) ?? defaultPromotedAction];
    })(),
};

export default story;
export {Default, TwoPromotedActions, ThreePromotedActions};
