import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type {ThemeColors} from '@styles/theme/types';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {GestureResponderEvent} from 'react-native';

type SwipeActionTint = keyof ThemeColors['swipeActionTint'];

type SwipeableRowAction = {
    /** Unique key of the action within its side */
    key: string;

    /** Icon shown on the action. A name, so the icon is only loaded once the action is shown. */
    icon: ExpensifyIconName;

    /** Short label shown under the icon, for example "Read" */
    label: string;

    /** Color of the icon and its circle; neutral when not set */
    tint?: SwipeActionTint;

    /** Full name read by screen readers, for example "Mark as read" */
    accessibilityLabel: string;

    /** Label reported to Sentry when the action is tapped */
    sentryLabel: string;

    /** Runs the action. The row closes right after. */
    onPress: (event?: GestureResponderEvent) => void;
};

type SwipeableRowActions = {
    /** Actions revealed by swiping right. The first one sits at the outer edge and runs on a full swipe. */
    leading: SwipeableRowAction[];

    /** Actions revealed by swiping left. The first one sits at the outer edge and runs on a full swipe. */
    trailing: SwipeableRowAction[];
};

type SwipeableRowProps = ChildrenProps & {
    /**
     * Builds the row's actions. Called only when the row is touched or swiped, so idle renders don't translate labels
     * or create action objects.
     */
    getActions?: () => SwipeableRowActions;

    /** Turns swiping off, for example in wide layouts or selection mode */
    isDisabled?: boolean;

    /** Identifies the row's content. The row closes when it changes, because list cells are recycled. */
    rowKey: string | undefined;
};

export type {SwipeActionTint, SwipeableRowAction, SwipeableRowActions, SwipeableRowProps};
