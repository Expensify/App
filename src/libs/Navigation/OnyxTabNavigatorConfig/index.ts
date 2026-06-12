import type {TabRouterOptions} from '@react-navigation/routers';

const defaultScreenOptions = {
    animation: 'default',
} as const;

/** On native there is no browser history; hardware back returns to the initial tab first, per platform convention. */
const backBehavior: NonNullable<TabRouterOptions['backBehavior']> = 'initialRoute';

export {defaultScreenOptions, backBehavior};
