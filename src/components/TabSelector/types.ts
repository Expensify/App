import type {ThemeColors} from '@styles/theme/types';

import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated, StyleProp, View, ViewStyle} from 'react-native';

type TabSelectorProps = MaterialTopTabBarProps & {
    onTabPress?: (name: string) => void;
    onLongTabPress?: (key: string) => void;

    /** Callback to register focus trap container element */
    onFocusTrapContainerElementChanged?: (element: HTMLElement | null) => void;

    shouldShowLabelWhenInactive?: boolean;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;
};

type TabSelectorBaseItem<K extends string = string> = WithSentryLabel & {
    /** Stable key for the tab. */
    key: K;

    /** Icon to display on the tab. */
    icon?: IconAsset;

    /** Localized title to display. */
    title: string;

    testID?: string;

    /** Text to display on the badge on the tab. */
    badgeText?: string;

    /** Whether the tab's badge should use the condensed (smaller) style. */
    isBadgeCondensed?: boolean;

    /** Additional styles for the tab's badge. */
    badgeStyles?: StyleProp<ViewStyle>;

    /** Whether this tab is disabled */
    isDisabled?: boolean;

    /** Called instead of selecting the tab when it is disabled. Keeps the tab pressable so it can explain why it is locked. */
    disabledAction?: () => void | Promise<void>;

    pendingAction?: PendingAction;

    /** Optional ref forwarded to this tab's pressable element, e.g. to anchor a popover to this specific tab. */
    tabRef?: Ref<View | HTMLDivElement>;

    /**
     * Whether this tab should respond to a long-press (touch) / right-click (web) via `onLongTabPress`.
     * Opt-in per tab so tabs that don't need it keep their native browser context menu on web
     * (a wired secondary interaction suppresses the native `contextmenu` event).
     */
    shouldEnableLongPress?: boolean;
};

type TabSelectorBaseProps<K extends string = string> = {
    tabs: Array<TabSelectorBaseItem<K>>;
    activeTabKey: K | undefined;
    onTabPress?: (key: K) => void;
    onLongTabPress?: (key: K) => void;
    onActiveTabPress?: (key: K) => void;

    /** Animated position from a navigator (optional). */
    position?: Animated.AnimatedInterpolation<number>;

    shouldShowLabelWhenInactive?: boolean;

    /** Whether tabs should have equal width. */
    equalWidth?: boolean;

    /** Additional styles for the tabs' scroll content container. */
    contentContainerStyles?: StyleProp<ViewStyle>;
};

type TabSelectorItemProps = WithSentryLabel & {
    tabKey: string;

    /** Function to call when onPress */
    onPress?: () => void;

    onLongPress?: () => void;

    /** Icon to display on tab */
    icon?: IconAsset;

    title?: string;

    /** Animated background color value for the tab button */
    backgroundColor?: string | Animated.AnimatedInterpolation<string>;

    /** Animated opacity value while the tab is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the tab is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether this tab is active */
    isActive?: boolean;

    shouldShowLabelWhenInactive?: boolean;
    testID?: string;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;

    /** Text to display on the badge on the tab. */
    badgeText?: string;

    /** Whether the tab's badge should use the condensed (smaller) style. */
    isBadgeCondensed?: boolean;

    /** Additional styles for the tab's badge. */
    badgeStyles?: StyleProp<ViewStyle>;

    /** Whether this tab is disabled */
    isDisabled?: boolean;

    /** Called instead of selecting the tab when it is disabled. Keeps the tab pressable so it can explain why it is locked. */
    disabledAction?: () => void | Promise<void>;

    pendingAction?: PendingAction;

    /** Optional ref forwarded to the tab's pressable element. */
    tabRef?: Ref<View | HTMLDivElement>;
};

type AnimationConfigBase = {
    routesLength: number;
    tabIndex: number;

    /**
     * The indices of the affected tabs.
     */
    affectedTabs: number[];

    position: Animated.AnimatedInterpolation<number> | undefined;
    isActive: boolean;
};

type GetBackgroundColorConfig = AnimationConfigBase & {
    theme: ThemeColors;
};

type GetOpacityConfig = AnimationConfigBase & {
    /**
     * Whether we are calculating the opacity for the active tab.
     */
    active: boolean;
};

type BackgroundColor = Animated.AnimatedInterpolation<string> | string;

type Opacity = 1 | 0 | Animated.AnimatedInterpolation<number>;

export type {TabSelectorProps, BackgroundColor, GetBackgroundColorConfig, Opacity, GetOpacityConfig, TabSelectorBaseProps, TabSelectorBaseItem, TabSelectorItemProps};
