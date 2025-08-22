import {findFocusedRoute, useNavigation, useRoute} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions, InteractionManager} from 'react-native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import type {NavigationRoute} from '@libs/Navigation/types';
import variables from '@styles/variables';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

type WideRHPContextType = {
    // Route keys of screens that should be displayed in wide format
    wideRHPRouteKeys: string[];

    // Progress of changing format: 0 - narrow, 1 - wide
    expandedRHPProgress: Animated.Value;

    // Progress of the secondary overlay, the one covering wider RHP screen
    secondOverlayProgress: Animated.Value;

    // If the secondary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlay: boolean;

    // Show given route as in wide format
    showWideRHPVersion: (route: NavigationRoute) => void;

    // Remove given route from the array
    cleanWideRHPRouteKey: (route: NavigationRoute) => void;

    // Mark reportID as expense before condition check
    markReportIDAsExpense: (reportID: string) => void;

    // Check if reportID is marked as expense
    isReportIDMarkedAsExpense: (reportID: string) => boolean;
};

const expandedRHPProgress = new Animated.Value(0);
const secondOverlayProgress = new Animated.Value(0);

const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + variables.sideBarWidth;

// Function to calculate receipt pane RHP width with minimum constraint
const calculateReceiptPaneRHPWidth = (windowWidth: number) => {
    const calculatedWidth = windowWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - windowWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - variables.sideBarWidth);
};

// This animated value is necessary to have a responsive rhp width for the range 800px to 840px.
const receiptPaneRHPWidth = new Animated.Value(calculateReceiptPaneRHPWidth(Dimensions.get('window').width));

const WideRHPContext = createContext<WideRHPContextType>({
    wideRHPRouteKeys: [],
    expandedRHPProgress,
    secondOverlayProgress,
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
});

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    const [wideRHPRouteKeys, setWideRHPRouteKeys] = useState<string[]>([]);
    const [shouldRenderSecondaryOverlay, setShouldRenderSecondaryOverlay] = useState(false);
    const [expenseReportIDs, setExpenseReportIDs] = useState<Set<string>>(new Set());

    const shouldShowSecondaryOverlay = useRootNavigationState((state) => {
        const focusedRoute = findFocusedRoute(state);
        const isRHPLastRootRoute = state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

        // Shouldn't ever happen but for type safety
        if (!focusedRoute?.key) {
            return false;
        }

        // Check the focused route to avoid glitching when quickly close and open RHP.
        if (wideRHPRouteKeys.length > 0 && !wideRHPRouteKeys.includes(focusedRoute.key) && isRHPLastRootRoute && focusedRoute.name !== SCREENS.SEARCH.REPORT_RHP) {
            return true;
        }

        return false;
    });

    const showWideRHPVersion = useCallback((route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to showWideRHPVersion should have the "key" property defined.`);
            return;
        }

        const newKey = route.key;

        // If the key is in the array, don't add it.
        setWideRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
    }, []);

    const cleanWideRHPRouteKey = useCallback(
        (route: NavigationRoute) => {
            if (!route.key) {
                console.error(`The route passed to cleanWideRHPRouteKey should have the "key" property defined.`);
                return;
            }

            const keyToRemove = route.key;

            // Do nothing, the key is not here
            if (!wideRHPRouteKeys.includes(keyToRemove)) {
                return;
            }

            setWideRHPRouteKeys((prev) => prev.filter((key) => key !== keyToRemove));
        },
        [wideRHPRouteKeys],
    );

    const markReportIDAsExpense = useCallback((reportID: string) => {
        setExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.add(reportID);
            return newSet;
        });
    }, []);

    const isReportIDMarkedAsExpense = useCallback(
        (reportID: string) => {
            return expenseReportIDs.has(reportID);
        },
        [expenseReportIDs],
    );

    useEffect(() => {
        if (wideRHPRouteKeys.length > 0) {
            Animated.timing(expandedRHPProgress, {
                toValue: 1,
                duration: 0,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(expandedRHPProgress, {
                toValue: 0,
                duration: 0,
                useNativeDriver: false,
            }).start();
        }
    }, [wideRHPRouteKeys.length]);

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

    // Effect to recalculate receiptPaneRHPWidth when dimensions change
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
            showWideRHPVersion,
            cleanWideRHPRouteKey,
            secondOverlayProgress,
            shouldRenderSecondaryOverlay,
            markReportIDAsExpense,
            isReportIDMarkedAsExpense,
        }),
        [wideRHPRouteKeys, showWideRHPVersion, cleanWideRHPRouteKey, shouldRenderSecondaryOverlay, markReportIDAsExpense, isReportIDMarkedAsExpense],
    );

    return <WideRHPContext.Provider value={value}>{children}</WideRHPContext.Provider>;
}

// Condition whether the screen where this hook is used should be displayed as wide. It's not always know from the beginning or can change after the screen is already mounted.
function useShowWideRHPVersion(condition: boolean) {
    const navigation = useNavigation();
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {showWideRHPVersion, cleanWideRHPRouteKey, isReportIDMarkedAsExpense} = useContext(WideRHPContext);

    useEffect(() => {
        return navigation.addListener('beforeRemove', () => {
            InteractionManager.runAfterInteractions(() => {
                cleanWideRHPRouteKey(route);
            });
        });
    }, [cleanWideRHPRouteKey, navigation, route]);

    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        const shouldShow = condition || (reportID && isReportIDMarkedAsExpense(reportID));

        if (!shouldShow) {
            return;
        }
        showWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion]);
}

export default WideRHPContextProvider;
export type {WideRHPContextType};
export {expandedRHPProgress, secondOverlayProgress, WideRHPContext, useShowWideRHPVersion, receiptPaneRHPWidth};
