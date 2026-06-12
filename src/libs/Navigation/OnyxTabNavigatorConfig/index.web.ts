import type {TabRouterOptions} from '@react-navigation/routers';

const defaultScreenOptions = {
    animation: 'none',
} as const;

/**
 * `none` keeps the tab history at a single entry, so `useLinking` replaces the browser entry instead of
 * pushing one — tab switches add no history and the browser back button leaves the whole flow.
 */
const backBehavior: NonNullable<TabRouterOptions['backBehavior']> = 'none';

export {defaultScreenOptions, backBehavior};
