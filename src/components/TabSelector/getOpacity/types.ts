import type {Animated} from 'react-native';

/**
 * Configuration for the getOpacity function.
 */
type GetOpacityConfig = {
    /**
     * The number of routes in the tab bar.
     */
    routesLength: number;

    /**
     * The index of the tab.
     */
    tabIndex: number;

    /**
     * Whether we are calculating the opacity for the active tab.
     */
    active: boolean;

    /**
     * The indexes of the tabs that are affected by the animation.
     */
    affectedTabs: number[];

    /**
     * Scene's position, value which we would like to interpolate.
     */
    position: Animated.AnimatedInterpolation<number> | undefined;

    /**
     * Whether the tab is active.
     */
    isActive: boolean;
};

/**
 * Function to get the opacity.
 * @param args - The configuration for the opacity.
 * @returns The interpolated opacity or a fixed value (1 or 0).
 */
type GetOpacity = (args: GetOpacityConfig) => 1 | 0 | Animated.AnimatedInterpolation<number>;

export default GetOpacity;
