import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, StackActions, useNavigation, useRoute} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions, InteractionManager} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationRoute} from '@libs/Navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import defaultWideRHPContextValue from './default';
import type {WideRHPContextType} from './types';

// 0 is folded/hidden, 1 is expanded/shown
const expandedRHPProgress = new Animated.Value(0);
const innerRHPProgress = new Animated.Value(0);
const secondOverlayProgress = new Animated.Value(0);
const thirdOverlayProgress = new Animated.Value(0);

const OVERLAY_TIMING_DURATION = 300;

// This array includes wide and super wide right modals
const WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_REPORT]);

const SUPER_WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT]);

function isSuperWideRHPRouteName(routeName: string) {
    return routeName === SCREENS.SEARCH.MONEY_REQUEST_REPORT || routeName === SCREENS.EXPENSE_REPORT_RHP;
}

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

const singleRHPWidth = variables.sideBarWidth;
const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + singleRHPWidth;

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
const calculateReceiptPaneRHPWidth = (windowWidth: number) => {
    const calculatedWidth = windowWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - windowWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - singleRHPWidth);
};

/**
 * Calculates the optimal width for the super wide RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated super wide RHP width with constraints applied
 */
const calculateSuperWideRHPWidth = (windowWidth: number) => {
    const superWideRHPWidth = windowWidth - variables.navigationTabBarSize - variables.sideBarWithLHBWidth;
    const wideRHPWidth = calculateReceiptPaneRHPWidth(windowWidth) + variables.sideBarWidth;

    return Math.max(Math.min(superWideRHPWidth, variables.superWideRHPMaxWidth), wideRHPWidth);
};

const receiptPaneRHPWidth = calculateReceiptPaneRHPWidth(Dimensions.get('window').width);
const superWideRHPWidth = calculateReceiptPaneRHPWidth(Dimensions.get('window').width);
const wideRHPWidth = receiptPaneRHPWidth + singleRHPWidth;

// This animated value is necessary to have responsive RHP widths
const animatedReceiptPaneRHPWidth = new Animated.Value(receiptPaneRHPWidth);
const animatedSuperWideRHPWidth = new Animated.Value(superWideRHPWidth);
const animatedWideRHPWidth = new Animated.Value(wideRHPWidth);
const modalStackOverlayWideRHPWidth = new Animated.Value(superWideRHPWidth - wideRHPWidth);
const modalStackOverlaySuperWideRHPWidth = new Animated.Value(superWideRHPWidth - singleRHPWidth);

const WideRHPContext = createContext<WideRHPContextType>(defaultWideRHPContextValue);

const expenseReportSelector = (reports: OnyxCollection<Report>) => {
    return Object.fromEntries(
        Object.entries(reports ?? {}).map(([key, report]) => [
            key,
            {
                reportID: report?.reportID,
                type: report?.type,
            },
        ]),
    );
};

function getCurrentWideRHPKeys(allWideRHPKeys: string[], lastVisibleRHPRouteKey: string | undefined) {
    const rootState = navigationRef.getRootState();

    if (!rootState) {
        return [];
    }

    const lastRHPRoute = rootState.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    if (!lastRHPRoute) {
        return [];
    }

    const lastRHPKeys = extractNavigationKeys(lastRHPRoute.state);
    const currentKeys = allWideRHPKeys.filter((key) => lastRHPKeys.has(key));

    return currentKeys;
}

function getLastVisibleRHPRouteKey(state: NavigationState | undefined) {
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
}

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    // We have a separate containers for allWideRHPRouteKeys and wideRHPRouteKeys because we may have two or more RHPs on the stack.
    // For convenience and proper overlay logic wideRHPRouteKeys will show only the keys existing in the last RHP.
    const [allWideRHPRouteKeys, setAllWideRHPRouteKeys] = useState<string[]>([]);
    const [wideRHPRouteKeys, setWideRHPRouteKeys] = useState<string[]>([]);
    const [allSuperWideRHPRouteKeys, setAllSuperWideRHPRouteKeys] = useState<string[]>([]);
    const [superWideRHPRouteKeys, setSuperWideRHPRouteKeys] = useState<string[]>([]);
    const [shouldRenderSecondaryOverlay, setShouldRenderSecondaryOverlay] = useState(false);
    const [shouldRenderTertiaryOverlay, setShouldRenderTertiaryOverlay] = useState(false);
    const [expenseReportIDs, setExpenseReportIDs] = useState<Set<string>>(new Set());
    const [multiTransactionExpenseReportIDs, setMultiTransactionExpenseReportIDs] = useState<Set<string>>(new Set());
    const [isWideRHPClosing, setIsWideRHPClosing] = useState(false);
    const focusedRouteKey = useRootNavigationState((state) => (state ? findFocusedRoute(state)?.key : undefined));
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: expenseReportSelector, canBeMissing: true});

    const syncWideRHPKeys = useCallback(() => {
        setWideRHPRouteKeys(getCurrentWideRHPKeys(allWideRHPRouteKeys, getLastVisibleRHPRouteKey(navigationRef.getRootState())));
    }, [allWideRHPRouteKeys]);

    const syncSuperWideRHPKeys = useCallback(() => {
        setSuperWideRHPRouteKeys(getCurrentWideRHPKeys(allSuperWideRHPRouteKeys, getLastVisibleRHPRouteKey(navigationRef.getRootState())));
    }, [allSuperWideRHPRouteKeys]);

    const clearWideRHPKeys = useCallback(() => {
        setWideRHPRouteKeys([]);
        setSuperWideRHPRouteKeys([]);
    }, []);

    useEffect(() => {
        syncWideRHPKeys();
    }, [allWideRHPRouteKeys, syncWideRHPKeys]);

    useEffect(() => {
        syncSuperWideRHPKeys();
    }, [allSuperWideRHPRouteKeys, syncSuperWideRHPKeys]);

    const isWideRHPFocused = useMemo(() => {
        return !!focusedRouteKey && wideRHPRouteKeys.includes(focusedRouteKey);
    }, [focusedRouteKey, wideRHPRouteKeys]);

    const getIsSuperWideRHPBelowFocusedScreen = useCallback(
        (state: NavigationState | undefined, lastVisibleRouteKey: string | undefined) => {
            if (!state) {
                return false;
            }

            const focusedRoute = findFocusedRoute(state);

            // Shouldn't ever happen but for type safety
            if (!focusedRoute?.key) {
                return false;
            }

            const currentSuperWideRHPRouteKeys = getCurrentWideRHPKeys(allSuperWideRHPRouteKeys, lastVisibleRouteKey);
            const isFocusedRouteSuperWide = isSuperWideRHPRouteName(focusedRoute.name);

            return currentSuperWideRHPRouteKeys.length > 0 && !currentSuperWideRHPRouteKeys.includes(focusedRoute.key) && !isFocusedRouteSuperWide;
        },
        [allSuperWideRHPRouteKeys],
    );

    const getIsWideRHPBelowFocusedScreen = useCallback(
        (state: NavigationState | undefined, lastVisibleRouteKey: string | undefined) => {
            if (!state) {
                return false;
            }

            const focusedRoute = findFocusedRoute(state);

            // Shouldn't ever happen but for type safety
            if (!focusedRoute?.key) {
                return false;
            }

            const currentWideRHPRouteKeys = getCurrentWideRHPKeys(allWideRHPRouteKeys, lastVisibleRouteKey);
            const isFocusedRouteWide = focusedRoute.name === SCREENS.SEARCH.REPORT_RHP;

            return currentWideRHPRouteKeys.length > 0 && !currentWideRHPRouteKeys.includes(focusedRoute.key) && !isFocusedRouteWide;
        },
        [allWideRHPRouteKeys],
    );

    /**
     * Determines whether the secondary overlay should be displayed.
     */
    const shouldShowSecondaryOverlay = useRootNavigationState((state) => {
        const isRHPLastRootRoute = state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        if (!isRHPLastRootRoute || !state) {
            return false;
        }

        const focusedRoute = findFocusedRoute(state);

        // Shouldn't ever happen but for type safety
        if (!focusedRoute?.key) {
            return false;
        }

        // For this screen the secondary overlay should never be shown, it is always displayed as 1 RHP in the order
        if (isSuperWideRHPRouteName(focusedRoute.name)) {
            return false;
        }

        const currentLastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
        const isWideRHPBelow = getIsWideRHPBelowFocusedScreen(state, currentLastVisibleRHPRouteKey);

        if (isWideRHPBelow) {
            return true;
        }

        const isSuperWideRHPBelow = getIsSuperWideRHPBelowFocusedScreen(state, currentLastVisibleRHPRouteKey);
        return isSuperWideRHPBelow;
    });

    /**
     * Determines whether the tertiary overlay should be displayed.
     */
    const shouldShowTertiaryOverlay = useRootNavigationState((state) => {
        const isRHPLastRootRoute = state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        if (!isRHPLastRootRoute) {
            return false;
        }

        const rhpState = state?.routes?.at(-1)?.state;

        // Shouldn't ever happen but for type safety
        if (!rhpState?.key) {
            return false;
        }

        const lastSuperWideRHPIndex = rhpState?.routes?.findLastIndex((route) => SUPER_WIDE_RIGHT_MODALS.has(route.name)) ?? -1;
        const isSuperWideRHPDirectlyBelowFocusedScreen = lastSuperWideRHPIndex === rhpState.routes.length - 2;

        if (isSuperWideRHPDirectlyBelowFocusedScreen) {
            return false;
        }

        const currentLastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
        const isWideRHPBelow = getIsWideRHPBelowFocusedScreen(state, currentLastVisibleRHPRouteKey);

        if (!isWideRHPBelow) {
            return false;
        }

        const isSuperWideRHPBelow = getIsSuperWideRHPBelowFocusedScreen(state, currentLastVisibleRHPRouteKey);
        return isSuperWideRHPBelow;
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
        // Ensure mutual exclusivity: remove key from other array if present
        setAllSuperWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev.filter((key) => key !== newKey) : prev));
        setAllWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
    }, []);

    const showSuperWideRHPVersion = useCallback((route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to showWideRHPVersion should have the "key" property defined.`);
            return;
        }

        const newKey = route.key;
        // If the key is in the array, don't add it.
        // Ensure mutual exclusivity: remove key from other array if present
        setAllWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev.filter((key) => key !== newKey) : prev));
        setAllSuperWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
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
            setAllSuperWideRHPRouteKeys((prev) => (prev.includes(keyToRemove) ? prev.filter((key) => key !== keyToRemove) : prev));
        },
        [allWideRHPRouteKeys, superWideRHPRouteKeys],
    );

    /**
     * Dismiss top layer modal and go back to the wide RHP.
     */
    const dismissToFirstRHP = useCallback(() => {
        const rootState = navigationRef.getRootState();
        if (!rootState) {
            return;
        }

        const rhpState = rootState.routes.findLast((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;

        if (!rhpState) {
            return;
        }

        let firstRHPIndex;

        // If Wide RHP is focused, we should dismiss to Super Wide RHP
        if (isWideRHPFocused) {
            firstRHPIndex = rhpState.routes.findLastIndex((route) => SUPER_WIDE_RIGHT_MODALS.has(route.name));
        } else {
            firstRHPIndex = rhpState.routes.findLastIndex((route) => WIDE_RIGHT_MODALS.has(route.name));
        }

        const routesToPop = rhpState.routes.length - firstRHPIndex - 1;

        // In the current navigation structure, hardcoding popTo SCREENS.RIGHT_MODAL.SEARCH_REPORT works exactly as we want.
        // It may change in the future and we may need to improve this function to handle more complex configurations.
        navigationRef.dispatch({...StackActions.pop(routesToPop), target: rhpState.key});
    }, [isWideRHPFocused]);

    /**
     * Dismiss top layer modal and go back to the wide RHP.
     */
    const dismissToSecondRHP = useCallback(() => {
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
    const markReportIDAsExpense = useCallback(
        (reportID: string) => {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const isInvoice = report?.type === CONST.REPORT.TYPE.INVOICE;
            const isTask = report?.type === CONST.REPORT.TYPE.TASK;
            if (isInvoice || isTask) {
                return;
            }
            setExpenseReportIDs((prev) => {
                const newSet = new Set(prev);
                newSet.add(reportID);
                return newSet;
            });
        },
        [allReports],
    );

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
     * Marks a report ID as a multi-transaction expense report, adding it to the expense reports set.
     * This enables optimistic super wide RHP display for expense reports.
     * It helps us open expense as super wide, before it fully loads.
     */
    const markReportIDAsMultiTransactionExpense = useCallback((reportID: string) => {
        setMultiTransactionExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.add(reportID);
            return newSet;
        });
    }, []);

    /**
     * Removes a report ID from the multi-transaction expense reports set.
     * This disables optimistic super wide RHP display for that specific report
     * (e.g., when transactions are deleted or report no longer qualifies as multi-transaction)
     */
    const unmarkReportIDAsMultiTransactionExpense = useCallback((reportID: string) => {
        setMultiTransactionExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(reportID);
            return newSet;
        });
    }, []);

    /**
     * Checks if a report ID is marked as a multi-transaction expense report.
     * Used to determine if super wide RHP should be displayed optimistically.
     * It helps us open expense as super wide, before it fully loads.
     */
    const isReportIDMarkedAsMultiTransactionExpense = useCallback(
        (reportID: string) => {
            return multiTransactionExpenseReportIDs.has(reportID);
        },
        [multiTransactionExpenseReportIDs],
    );

    /**
     * Effect that shows/hides the expanded RHP progress based on the number of wide RHP routes.
     */
    useEffect(() => {
        const numberOfSuperWideRoutes = superWideRHPRouteKeys.length;
        const numberOfWideRoutes = wideRHPRouteKeys.length;

        if (numberOfSuperWideRoutes > 0) {
            expandedRHPProgress.setValue(2);
            innerRHPProgress.setValue(numberOfWideRoutes > 0 ? 1 : 0);
        } else if (numberOfWideRoutes > 0) {
            expandedRHPProgress.setValue(1);
            innerRHPProgress.setValue(0);
        } else {
            expandedRHPProgress.setValue(0);
            innerRHPProgress.setValue(0);
        }
    }, [superWideRHPRouteKeys.length, wideRHPRouteKeys.length]);

    /**
     * Effect that manages the secondary overlay animation and rendering state.
     */
    useEffect(() => {
        if (shouldShowSecondaryOverlay) {
            setShouldRenderSecondaryOverlay(true);
            Animated.timing(secondOverlayProgress, {
                toValue: 1,
                duration: OVERLAY_TIMING_DURATION,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(secondOverlayProgress, {
                toValue: 0,
                duration: OVERLAY_TIMING_DURATION,
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
        if (shouldShowTertiaryOverlay) {
            setShouldRenderTertiaryOverlay(true);
            Animated.timing(thirdOverlayProgress, {
                toValue: 1,
                duration: OVERLAY_TIMING_DURATION,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(thirdOverlayProgress, {
                toValue: 0,
                duration: OVERLAY_TIMING_DURATION,
                useNativeDriver: false,
            }).start(() => {
                setShouldRenderTertiaryOverlay(false);
            });
        }
    }, [shouldShowTertiaryOverlay]);

    /**
     * Effect that handles responsive RHP width calculation when window dimensions change.
     * Listens for dimension changes and recalculates the optimal RHP width accordingly.
     */
    useEffect(() => {
        const handleDimensionChange = () => {
            const windowWidth = Dimensions.get('window').width;
            const newReceiptPaneRHPWidth = calculateReceiptPaneRHPWidth(windowWidth);
            const newSuperWideRHPWidth = calculateSuperWideRHPWidth(windowWidth);
            const newWideRHPWidth = newReceiptPaneRHPWidth + singleRHPWidth;
            animatedReceiptPaneRHPWidth.setValue(newReceiptPaneRHPWidth);
            animatedWideRHPWidth.setValue(newWideRHPWidth);
            modalStackOverlayWideRHPWidth.setValue(newSuperWideRHPWidth - newWideRHPWidth);
            modalStackOverlaySuperWideRHPWidth.setValue(newSuperWideRHPWidth - singleRHPWidth);
            animatedSuperWideRHPWidth.setValue(newSuperWideRHPWidth);
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
            shouldRenderSecondaryOverlay,
            shouldRenderTertiaryOverlay,
            dismissToFirstRHP,
            dismissToSecondRHP,
            markReportIDAsExpense,
            markReportIDAsMultiTransactionExpense,
            unmarkReportIDAsMultiTransactionExpense,
            isReportIDMarkedAsExpense,
            isReportIDMarkedAsMultiTransactionExpense,
            isWideRHPFocused,
            isWideRHPClosing,
            setIsWideRHPClosing,
            syncWideRHPKeys,
            syncSuperWideRHPKeys,
            clearWideRHPKeys,
        }),
        [
            wideRHPRouteKeys,
            superWideRHPRouteKeys,
            showWideRHPVersion,
            showSuperWideRHPVersion,
            cleanWideRHPRouteKey,
            shouldRenderSecondaryOverlay,
            shouldRenderTertiaryOverlay,
            dismissToFirstRHP,
            dismissToSecondRHP,
            markReportIDAsExpense,
            markReportIDAsMultiTransactionExpense,
            unmarkReportIDAsMultiTransactionExpense,
            isReportIDMarkedAsExpense,
            isReportIDMarkedAsMultiTransactionExpense,
            isWideRHPFocused,
            isWideRHPClosing,
            syncWideRHPKeys,
            syncSuperWideRHPKeys,
            clearWideRHPKeys,
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
    const {showWideRHPVersion, cleanWideRHPRouteKey, isReportIDMarkedAsExpense, setIsWideRHPClosing} = useContext(WideRHPContext);

    /**
     * Effect that sets up cleanup when the screen is about to be removed.
     * Uses InteractionManager to ensure cleanup happens after closing animation.
     */
    useEffect(() => {
        return navigation.addListener('beforeRemove', () => {
            setIsWideRHPClosing(true);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                cleanWideRHPRouteKey(route);
                setIsWideRHPClosing(false);
            });
        });
    }, [cleanWideRHPRouteKey, navigation, route, setIsWideRHPClosing]);

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
    const {showWideRHPVersion, showSuperWideRHPVersion, cleanWideRHPRouteKey, isReportIDMarkedAsExpense, isReportIDMarkedAsMultiTransactionExpense} = useContext(WideRHPContext);

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
        if (condition || (reportID && isReportIDMarkedAsMultiTransactionExpense(reportID))) {
            showSuperWideRHPVersion(route);
            return;
        }
        showWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion, showSuperWideRHPVersion, isReportIDMarkedAsMultiTransactionExpense]);
}

WideRHPContextProvider.displayName = 'WideRHPContextProvider';

export default WideRHPContextProvider;

export {
    calculateReceiptPaneRHPWidth,
    calculateSuperWideRHPWidth,
    animatedSuperWideRHPWidth,
    modalStackOverlaySuperWideRHPWidth,
    modalStackOverlayWideRHPWidth,
    animatedReceiptPaneRHPWidth,
    secondOverlayProgress,
    thirdOverlayProgress,
    useShowSuperWideRHPVersion,
    useShowWideRHPVersion,
    WideRHPContext,
    animatedWideRHPWidth,
    innerRHPProgress,
    expandedRHPProgress,
    WIDE_RIGHT_MODALS,
    SUPER_WIDE_RIGHT_MODALS,
};
