import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';
import type {ThemeColors} from '@styles/theme/types';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

type TabSelectorProps = MaterialTopTabBarProps & {
    /* Callback fired when tab is pressed */
    onTabPress?: (name: string) => void;

    /** Callback to register focus trap container element */
    onFocusTrapContainerElementChanged?: (element: HTMLElement | null) => void;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;
};

type TabSelectorBaseItem = WithSentryLabel & {
    /** Stable key for the tab. */
    key: string;

    /** Icon to display on the tab. */
    icon?: IconAsset;

    /** Localized title to display. */
    title: string;

    /** Test identifier used to find elements in tests. */
    testID?: string;
};

type TabSelectorBaseProps = {
    /** Tabs to render. */
    tabs: TabSelectorBaseItem[];

    /** Key of the currently active tab. */
    activeTabKey: string;

    /** Called when a tab is pressed with its key. */
    onTabPress?: (key: string) => void;

    /** Animated position from a navigator (optional). */
    position?: Animated.AnimatedInterpolation<number>;

    /** Whether to show the label when the tab is inactive. */
    shouldShowLabelWhenInactive?: boolean;

    /** Whether tabs should have equal width. */
    equalWidth?: boolean;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;
};

type TabSelectorItemProps = WithSentryLabel & {
    /** Function to call when onPress */
    onPress?: () => void;

    /** Icon to display on tab */
    icon?: IconAsset;

    /** Title of the tab */
    title?: string;

    /** Animated background color value for the tab button */
    backgroundColor?: string | Animated.AnimatedInterpolation<string>;

    /** Animated opacity value while the tab is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the tab is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether this tab is active */
    isActive?: boolean;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;

    /** Test identifier used to find elements in tests */
    testID?: string;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;
};

type AnimationConfigBase = {
    /**
     * The number of routes.
     */
    routesLength: number;

    /**
     * The index of the current tab.
     */
    tabIndex: number;

    /**
     * The indices of the affected tabs.
     */
    affectedTabs: number[];

    /**
     * The animated position interpolation.
     */
    position: Animated.AnimatedInterpolation<number> | undefined;

    /**
     * Whether the tab is active.
     */
    isActive: boolean;
};

type GetBackgroundColorConfig = AnimationConfigBase & {
    /**
     * The theme colors.
     */
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
