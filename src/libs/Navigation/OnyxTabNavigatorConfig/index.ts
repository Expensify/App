import type {TabRouterOptions} from '@react-navigation/native';

const defaultScreenOptions = {
    animation: 'default',
} as const;

/**
 * `none` keeps the tab history at a single entry, so back — hardware or header — leaves the whole flow instead of
 * returning to the initial tab first. Every OnyxTabNavigator is an RHP/modal flow where back should dismiss it, so
 * this matches web and the iOS swipe gesture.
 */
const backBehavior: NonNullable<TabRouterOptions['backBehavior']> = 'none';

export {defaultScreenOptions, backBehavior};
