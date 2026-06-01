import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';

type ContextMenuItemStory = StoryFn<typeof ContextMenuItem>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ContextMenuItem> = {
    title: 'Overlays & Menus/ContextMenuItem',
    component: ContextMenuItem,
};

function Template(props: React.ComponentProps<typeof ContextMenuItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['Copy']);
    return (
        <ContextMenuItem
            {...props}
            icon={props.icon ?? icons.Copy}
        />
    );
}

const Default: ContextMenuItemStory = Template.bind({});
Default.args = {
    text: 'Copy to clipboard',
    onPress: () => {},
    sentryLabel: CONST.SENTRY_LABEL.COLLAPSIBLE_SECTION.TOGGLE,
};

const WithSuccess: ContextMenuItemStory = Template.bind({});
WithSuccess.args = {
    text: 'Copy link',
    successText: 'Copied!',
    onPress: () => {},
    sentryLabel: CONST.SENTRY_LABEL.COLLAPSIBLE_SECTION.TOGGLE,
};

export default story;
export {Default, WithSuccess};
