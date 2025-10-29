import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, StackActions, useNavigation, useRoute} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions, InteractionManager} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationRoute} from '@libs/Navigation/types';
import variables from '@styles/variables';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultWideRHPContextValue from './default';
import type {WideRHPContextType} from './types';

// 0 is folded/hidden, 1 is expanded/shown
const secondOverlayProgress = new Animated.Value(0);
const thirdOverlayProgress = new Animated.Value(0);

const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + variables.sideBarWidth;

/**
 * Utility function that extracts all unique navigation keys from a React Navigation state.
 * Recursively traverses the navigation state tree and collects all route keys.
 *
 * @param state - The React Navigation state (can be partial or complete)
 * @returns Set of unique route keys found in the navigation state
 */
function extractNavigationKeys(state: NavigationState | PartialState<NavigationState> | undefined): Set<string> {
    if (!state || !state.routes) {
        return new Set();
    }

    const keys = new Set<string>();
    const routesToProcess = [...state.routes];

    while (routesToProcess.length > 0) {
        const route = routesToProcess.pop();
        if (!route) {
            continue;
        }

        // Add the current route key to the set
        if (route.key) {
            keys.add(route.key);
        }

        // If the route has a nested state, add its routes to the processing queue
        if (route.state && 'routes' in route.state && Array.isArray(route.state.routes)) {
            routesToProcess.push(...route.state.routes);
        }
    }

    return keys;
}

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
const calculateReceiptPaneRHPWidth = (windowWidth: number) => {
    const calculatedWidth = windowWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - windowWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - variables.sideBarWidth);
};

// This animated value is necessary to have a responsive RHP width for the range 800px to 840px.
const receiptPaneRHPWidth = new Animated.Value(calculateReceiptPaneRHPWidth(Dimensions.get('window').width));

const WideRHPContext = createContext<WideRHPContextType>(defaultWideRHPContextValue);

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    // We have a separate containers for allWideRHPRouteKeys and wideRHPRouteKeys because we may have two or more RHPs on the stack.
    // For convenience and proper overlay logic wideRHPRouteKeys will show only the keys existing in the last RHP.
    const [allWideRHPRouteKeys, setAllWideRHPRouteKeys] = useState<string[]>([]);
    const [superWideRHPRouteKeys, setSuperWideRHPRouteKeys] = useState<string[]>([]);
    const [shouldRenderSecondaryOverlay, setShouldRenderSecondaryOverlay] = useState(false);
    const [shouldRenderThirdOverlay, setShouldRenderThirdOverlay] = useState(false);
    const [expenseReportIDs, setExpenseReportIDs] = useState<Set<string>>(new Set());

    const expandedRHPProgress = useSharedValue<number>(0);

    const focusedRouteKey = useRootNavigationState((state) => findFocusedRoute(state))?.key;

    // Return undefined if RHP is not the last route
    const lastVisibleRHPRouteKey = useRootNavigationState((state) => {
        // Safe handling when navigation is not yet initialized
        if (!state) {
            return undefined;
        }
        const lastFullScreenRouteIndex = state?.routes.findLastIndex((route) => isFullScreenName(route.name));
        const lastRHPRouteIndex = state?.routes.findLastIndex((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

        // Both routes have to be present and the RHP have to be after last full screen for it to be visible.
        if (lastFullScreenRouteIndex === -1 || lastRHPRouteIndex === -1 || lastFullScreenRouteIndex > lastRHPRouteIndex) {
            return undefined;
        }

        return state?.routes.at(lastRHPRouteIndex)?.key;
    });

    const wideRHPRouteKeys = useMemo(() => {
        const rootState = navigationRef.getRootState();

        if (!rootState) {
            return [];
        }

        const lastRHPRoute = rootState.routes.find((route) => route.key === lastVisibleRHPRouteKey);

        if (!lastRHPRoute) {
            return [];
        }

        const lastRHPKeys = extractNavigationKeys(lastRHPRoute.state);
        const currentKeys = allWideRHPRouteKeys.filter((key) => lastRHPKeys.has(key));

        return currentKeys;
    }, [allWideRHPRouteKeys, lastVisibleRHPRouteKey]);

    const isWideRhpFocused = useMemo(() => {
        return focusedRouteKey && wideRHPRouteKeys.includes(focusedRouteKey);
    }, [focusedRouteKey, wideRHPRouteKeys]);

    /**
     * Determines whether the secondary overlay should be displayed.
     * Shows second overlay when RHP is open and there is a wide RHP route open but there is another regular route on the top.
     */
    const shouldShowSecondaryOverlay = useRootNavigationState((state) => {
        // Safe handling when navigation is not yet initialized
        if (!state) {
            return false;
        }

        const focusedRoute = findFocusedRoute(state);
        const isRHPLastRootRoute = state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        // Shouldn't ever happen but for type safety
        if (!focusedRoute?.key) {
            return false;
        }

        if (superWideRHPRouteKeys.includes(focusedRoute.key) && wideRHPRouteKeys.length > 0) {
            return false;
        }

        if (superWideRHPRouteKeys.length > 0 && !superWideRHPRouteKeys.includes(focusedRoute.key) && isRHPLastRootRoute && focusedRoute.name !== SCREENS.SEARCH.MONEY_REQUEST_REPORT) {
            return true;
        }

        // Check the focused route to avoid glitching when quickly close and open RHP.
        if (wideRHPRouteKeys.length > 0 && !wideRHPRouteKeys.includes(focusedRoute.key) && isRHPLastRootRoute && focusedRoute.name !== SCREENS.SEARCH.REPORT_RHP) {
            return true;
        }

        return false;
    });

    const shouldShowThirdOverlay = useRootNavigationState((state) => {
        // Safe handling when navigation is not yet initialized
        if (!state) {
            return false;
        }

        const focusedRoute = findFocusedRoute(state);
        const isRHPLastRootRoute = state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        // Shouldn't ever happen but for type safety
        if (!focusedRoute?.key) {
            return false;
        }

        const isSuperWideRhpDisplayedBelow =
            superWideRHPRouteKeys.length > 0 && !superWideRHPRouteKeys.includes(focusedRoute.key) && focusedRoute.name !== SCREENS.SEARCH.MONEY_REQUEST_REPORT;
        const isWideRhpDisplayedBelow = wideRHPRouteKeys.length > 0 && !wideRHPRouteKeys.includes(focusedRoute.key) && focusedRoute.name !== SCREENS.SEARCH.REPORT_RHP;

        // Check the focused route to avoid glitching when quickly close and open RHP.
        return isSuperWideRhpDisplayedBelow && isWideRhpDisplayedBelow && isRHPLastRootRoute;
    });

    /**
     * Adds a route to the wide RHP route keys list, enabling wide RHP display for that route.
     */
    const showWideRHPVersion = useCallback((route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to showWideRHPVersion should have the "key" property defined.`);
            return;
        }

        const newKey = route.key;

        // If the key is in the array, don't add it.
        setAllWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
    }, []);

    const showSuperWideRHPVersion = useCallback((route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to showWideRHPVersion should have the "key" property defined.`);
            return;
        }

        const newKey = route.key;

        // If the key is in the array, don't add it.
        setSuperWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
    }, []);

    /**
     * Removes a route from the wide RHP route keys list, disabling wide RHP display for that route.
     */
    const cleanWideRHPRouteKey = useCallback(
        (route: NavigationRoute) => {
            if (!route.key) {
                console.error(`The route passed to cleanWideRHPRouteKey should have the "key" property defined.`);
                return;
            }

            const keyToRemove = route.key;

            // Do nothing, the key is not here
            if (!allWideRHPRouteKeys.includes(keyToRemove) && !superWideRHPRouteKeys.includes(keyToRemove)) {
                return;
            }

            setAllWideRHPRouteKeys((prev) => (prev.includes(keyToRemove) ? prev.filter((key) => key !== keyToRemove) : prev));
            setSuperWideRHPRouteKeys((prev) => (prev.includes(keyToRemove) ? prev.filter((key) => key !== keyToRemove) : prev));
        },
        [allWideRHPRouteKeys, superWideRHPRouteKeys],
    );

    /**
     * Dismiss top layer modal and go back to the wide RHP.
     */
    const dismissToWideReport = useCallback(() => {
        const rootState = navigationRef.getRootState();
        if (!rootState) {
            return;
        }

        const rhpStateKey = rootState.routes.findLast((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state?.key;

        if (!rhpStateKey) {
            return;
        }

        // In the current navigation structure, hardcoding popTo SCREENS.RIGHT_MODAL.SEARCH_REPORT works exactly as we want.
        // It may change in the future and we may need to improve this function to handle more complex configurations.
        navigationRef.dispatch({...StackActions.popTo(SCREENS.RIGHT_MODAL.SEARCH_REPORT), target: rhpStateKey});
    }, []);

    /**
     * Marks a report ID as an expense report, adding it to the expense reports set.
     * This enables optimistic wide RHP display for expense reports.
     * It helps us open expense as wide, before it fully loads.
     */
    const markReportIDAsExpense = useCallback((reportID: string) => {
        setExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.add(reportID);
            return newSet;
        });
    }, []);

    /**
     * Checks if a report ID is marked as an expense report.
     * Used to determine if wide RHP should be displayed optimistically.
     * It helps us open expense as wide, before it fully loads.
     */
    const isReportIDMarkedAsExpense = useCallback(
        (reportID: string) => {
            return expenseReportIDs.has(reportID);
        },
        [expenseReportIDs],
    );

    /**
     * Effect that shows/hides the expanded RHP progress based on the number of wide RHP routes.
     */
    useEffect(() => {
        if (superWideRHPRouteKeys.length > 0) {
            expandedRHPProgress.set(2);
        } else if (wideRHPRouteKeys.length > 0) {
            expandedRHPProgress.set(1);
        } else {
            expandedRHPProgress.set(0);
        }
    }, [expandedRHPProgress, superWideRHPRouteKeys.length, wideRHPRouteKeys.length]);

    /**
     * Effect that manages the secondary overlay animation and rendering state.
     */
    useEffect(() => {
        if (shouldShowSecondaryOverlay) {
            setShouldRenderSecondaryOverlay(true);
            Animated.timing(secondOverlayProgress, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(secondOverlayProgress, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setShouldRenderSecondaryOverlay(false);
            });
        }
    }, [shouldShowSecondaryOverlay]);

    /**
     * Effect that manages the secondary overlay animation and rendering state.
     */
    useEffect(() => {
        if (shouldShowThirdOverlay) {
            setShouldRenderThirdOverlay(true);
            Animated.timing(thirdOverlayProgress, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(thirdOverlayProgress, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setShouldRenderThirdOverlay(false);
            });
        }
    }, [shouldShowThirdOverlay]);

    /**
     * Effect that handles responsive RHP width calculation when window dimensions change.
     * Listens for dimension changes and recalculates the optimal RHP width accordingly.
     */
    useEffect(() => {
        const handleDimensionChange = () => {
            const windowWidth = Dimensions.get('window').width;
            const newWidth = calculateReceiptPaneRHPWidth(windowWidth);

            receiptPaneRHPWidth.setValue(newWidth);
        };

        // Set initial value
        handleDimensionChange();

        // Add event listener for dimension changes
        const subscription = Dimensions.addEventListener('change', handleDimensionChange);

        // Cleanup subscription on unmount
        return () => subscription?.remove();
    }, []);

    const value = useMemo(
        () => ({
            expandedRHPProgress,
            wideRHPRouteKeys,
            superWideRHPRouteKeys,
            showWideRHPVersion,
            showSuperWideRHPVersion,
            cleanWideRHPRouteKey,
            secondOverlayProgress,
            thirdOverlayProgress,
            shouldRenderSecondaryOverlay,
            shouldRenderThirdOverlay,
            dismissToWideReport,
            markReportIDAsExpense,
            isReportIDMarkedAsExpense,
            isWideRhpFocused,
        }),
        [
            expandedRHPProgress,
            wideRHPRouteKeys,
            superWideRHPRouteKeys,
            showWideRHPVersion,
            showSuperWideRHPVersion,
            cleanWideRHPRouteKey,
            shouldRenderSecondaryOverlay,
            shouldRenderThirdOverlay,
            dismissToWideReport,
            markReportIDAsExpense,
            isReportIDMarkedAsExpense,
            isWideRhpFocused,
        ],
    );

    return <WideRHPContext.Provider value={value}>{children}</WideRHPContext.Provider>;
}

/**
 * Hook that manages wide RHP display for a screen based on condition or optimistic state.
 * Automatically registers the route for wide RHP when condition is met or report is marked as expense.
 * Cleans up the route registration when the screen is removed.
 *
 * @param condition - Boolean condition determining if the screen should display as wide RHP
 */
function useShowWideRHPVersion(condition: boolean) {
    const navigation = useNavigation();
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {showWideRHPVersion, cleanWideRHPRouteKey, isReportIDMarkedAsExpense} = useContext(WideRHPContext);

    /**
     * Effect that sets up cleanup when the screen is about to be removed.
     * Uses InteractionManager to ensure cleanup happens after closing animation.
     */
    useEffect(() => {
        return navigation.addListener('beforeRemove', () => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                cleanWideRHPRouteKey(route);
            });
        });
    }, [cleanWideRHPRouteKey, navigation, route]);

    /**
     * Effect that determines whether to show wide RHP based on condition or optimistic state.
     * Shows wide RHP if either the condition is true OR the reportID is marked as an expense.
     */
    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        const shouldShow = condition || (reportID && isReportIDMarkedAsExpense(reportID));

        if (!shouldShow) {
            return;
        }
        showWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion]);
}

function useShowSuperWideRHPVersion(condition: boolean) {
    const navigation = useNavigation();
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {showWideRHPVersion, showSuperWideRHPVersion, cleanWideRHPRouteKey, isReportIDMarkedAsExpense} = useContext(WideRHPContext);

    /**
     * Effect that sets up cleanup when the screen is about to be removed.
     * Uses InteractionManager to ensure cleanup happens after closing animation.
     */
    useEffect(() => {
        return navigation.addListener('beforeRemove', () => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                cleanWideRHPRouteKey(route);
            });
        });
    }, [cleanWideRHPRouteKey, navigation, route]);

    /**
     * Effect that determines whether to show wide RHP based on condition or optimistic state.
     * Shows wide RHP if either the condition is true OR the reportID is marked as an expense.
     */
    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        if (!condition) {
            showWideRHPVersion(route);
            return;
        }
        showSuperWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion, showSuperWideRHPVersion]);
}

WideRHPContextProvider.displayName = 'WideRHPContextProvider';

export default WideRHPContextProvider;

export {calculateReceiptPaneRHPWidth, extractNavigationKeys, receiptPaneRHPWidth, secondOverlayProgress, useShowSuperWideRHPVersion, useShowWideRHPVersion, WideRHPContext};
