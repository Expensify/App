import {findFocusedRoute} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import type {NavigationRoute} from '@libs/Navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {defaultWideRHPActionsContextValue, defaultWideRHPStateContextValue} from './default';
import getIsRHPDisplayedBelow from './getIsRHPDisplayedBelow';
import getVisibleRHPKeys from './getVisibleRHPRouteKeys';
import type {WideRHPActionsContextType, WideRHPStateContextType} from './types';
import useShouldRenderOverlay from './useShouldRenderOverlay';

// 0 is folded/hidden, 1 is expanded/shown
const expandedRHPProgress = new Animated.Value(0);
const secondOverlayWideRHPProgress = new Animated.Value(0);
const secondOverlayRHPOnWideRHPProgress = new Animated.Value(0);
const secondOverlayRHPOnSuperWideRHPProgress = new Animated.Value(0);
const thirdOverlayProgress = new Animated.Value(0);

// The width of the left panel in Wide RHP where the receipt is displayed
const receiptPaneRHPWidth = calculateReceiptPaneRHPWidth(Dimensions.get('window').width);

// Static values of all RHP widths
const singleRHPWidth = variables.sideBarWidth;
const superWideRHPWidth = calculateSuperWideRHPWidth(Dimensions.get('window').width);
const wideRHPWidth = receiptPaneRHPWidth + singleRHPWidth;

// This animated value is necessary to have responsive RHP widths
const animatedReceiptPaneRHPWidth = new Animated.Value(receiptPaneRHPWidth);
const animatedSuperWideRHPWidth = new Animated.Value(superWideRHPWidth);
const animatedWideRHPWidth = new Animated.Value(wideRHPWidth);

// The left position values of overlays displayed in ModalStackNavigators. A detailed description of how these positions are calculated can be found in src/libs/Navigation/AppNavigator/ModalStackNavigators/index.tsx
const modalStackOverlayWideRHPPositionLeft = new Animated.Value(superWideRHPWidth - wideRHPWidth);
const modalStackOverlaySuperWideRHPPositionLeft = new Animated.Value(superWideRHPWidth - singleRHPWidth);

const WideRHPStateContext = createContext<WideRHPStateContextType>(defaultWideRHPStateContextValue);
const WideRHPActionsContext = createContext<WideRHPActionsContextType>(defaultWideRHPActionsContextValue);

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

// Function to add a Wide/Super Wide RHP route key to the array including wide/super wide RHP route keys
function showWideRHPRoute(route: NavigationRoute, setAllRHPRouteKeys: React.Dispatch<React.SetStateAction<string[]>>) {
    if (!route.key) {
        console.error(`The route passed to showWideRHPRoute should have the "key" property defined.`);
        return;
    }

    const newKey = route.key;
    setAllRHPRouteKeys((prev) => (prev.includes(newKey) ? prev : [newKey, ...prev]));
}

// Function to remove a Wide/Super Wide RHP route key to the array including wide/super wide RHP route keys
function removeWideRHPRoute(route: NavigationRoute, setAllRHPRouteKeys: React.Dispatch<React.SetStateAction<string[]>>) {
    if (!route.key) {
        console.error(`The route passed to removeWideRHPRouteKey should have the "key" property defined.`);
        return;
    }

    const keyToRemove = route.key;
    setAllRHPRouteKeys((prev) => (prev.includes(keyToRemove) ? prev.filter((key) => key !== keyToRemove) : prev));
}

// Set the rhp width based on the super wide / wide rhp route keys
function setExpandedRHPProgress(superWideRHPRouteKeys: string[], wideRHPRouteKeys: string[]) {
    const numberOfSuperWideRoutes = superWideRHPRouteKeys.length;
    const numberOfWideRoutes = wideRHPRouteKeys.length;

    if (numberOfSuperWideRoutes > 0) {
        expandedRHPProgress.setValue(2);
    } else if (numberOfWideRoutes > 0) {
        expandedRHPProgress.setValue(1);
    } else {
        expandedRHPProgress.setValue(0);
    }
}

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    // We have a separate containers for allWideRHPRouteKeys and wideRHPRouteKeys because we may have two or more RHPs on the stack.
    // For convenience and proper overlay logic wideRHPRouteKeys will show only the keys existing in the last RHP.
    const [allWideRHPRouteKeys, setAllWideRHPRouteKeys] = useState<string[]>([]);
    const [wideRHPRouteKeys, setWideRHPRouteKeys] = useState<string[]>([]);

    // Same as above but for Super Wide RHP
    const [allSuperWideRHPRouteKeys, setAllSuperWideRHPRouteKeys] = useState<string[]>([]);
    const [superWideRHPRouteKeys, setSuperWideRHPRouteKeys] = useState<string[]>([]);

    // Report IDs that should be displayed in Wide/Super Wide RHP
    const [expenseReportIDs, setExpenseReportIDs] = useState<Set<string>>(new Set());
    const [multiTransactionExpenseReportIDs, setMultiTransactionExpenseReportIDs] = useState<Set<string>>(new Set());

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: expenseReportSelector, canBeMissing: true});

    const isWideRHPClosingRef = useRef(false);
    const isSuperWideRHPClosingRef = useRef(false);

    const setIsWideRHPClosing = (isClosing: boolean) => {
        isWideRHPClosingRef.current = isClosing;
    };

    const setIsSuperWideRHPClosing = (isClosing: boolean) => {
        isSuperWideRHPClosingRef.current = isClosing;
    };

    const {focusedRoute, focusedNavigator} = useRootNavigationState((state) => {
        if (!state) {
            return {focusedRoute: undefined, focusedNavigator: undefined};
        }

        return {
            focusedRoute: findFocusedRoute(state),
            focusedNavigator: state.routes.at(-1)?.name,
        };
    });

    const isWideRHPFocused = !!focusedRoute?.key && allWideRHPRouteKeys.includes(focusedRoute.key);
    const isSuperWideRHPFocused = !!focusedRoute?.key && allSuperWideRHPRouteKeys.includes(focusedRoute.key);

    const isRHPFocused = focusedNavigator === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    // Whether Wide RHP is displayed below the currently displayed screen
    const {isWideRHPBelow, isSuperWideRHPBelow} = getIsRHPDisplayedBelow(focusedRoute?.key, allSuperWideRHPRouteKeys, allWideRHPRouteKeys);

    // Updates the Wide RHP visible keys table from the all keys table
    const syncRHPKeys = useCallback(() => {
        const {visibleSuperWideRHPRouteKeys, visibleWideRHPRouteKeys} = getVisibleRHPKeys(allSuperWideRHPRouteKeys, allWideRHPRouteKeys);
        setWideRHPRouteKeys(visibleWideRHPRouteKeys);
        setSuperWideRHPRouteKeys(visibleSuperWideRHPRouteKeys);
        setExpandedRHPProgress(visibleSuperWideRHPRouteKeys, visibleWideRHPRouteKeys);
    }, [allSuperWideRHPRouteKeys, allWideRHPRouteKeys]);

    const clearWideRHPKeys = () => {
        setWideRHPRouteKeys([]);
        setSuperWideRHPRouteKeys([]);
        expandedRHPProgress.setValue(0);
    };

    // Once we have updated the array of all Super Wide RHP keys, we should sync it with the array of RHP keys visible on the screen
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        syncRHPKeys();
    }, [allSuperWideRHPRouteKeys, allWideRHPRouteKeys, syncRHPKeys]);

    /**
     * Effect that manages the secondary overlay animation for single RHP displayed on Super Wide RHP and rendering state.
     */
    const shouldRenderSecondaryOverlayForRHPOnSuperWideRHP = useShouldRenderOverlay(
        isRHPFocused && isSuperWideRHPBelow && !isWideRHPBelow && !isWideRHPFocused,
        secondOverlayRHPOnSuperWideRHPProgress,
    );

    /**
     * Effect that manages the secondary overlay animation for single RHP displayed on Wide RHP and rendering state.
     */
    const shouldRenderSecondaryOverlayForRHPOnWideRHP = useShouldRenderOverlay(isRHPFocused && isWideRHPBelow && !isWideRHPFocused, secondOverlayRHPOnWideRHPProgress);

    /**
     * Effect that manages the secondary overlay animation for Wide RHP displayed on Super Wide RHP and rendering state.
     */
    const shouldRenderSecondaryOverlayForWideRHP = useShouldRenderOverlay(isRHPFocused && isSuperWideRHPBelow && (!!isWideRHPFocused || isWideRHPBelow), secondOverlayWideRHPProgress);

    /**
     * Effect that manages the tertiary overlay animation and rendering state.
     */
    const shouldRenderTertiaryOverlay = useShouldRenderOverlay(isRHPFocused && isWideRHPBelow && isSuperWideRHPBelow, thirdOverlayProgress);

    /**
     * Removes a route from the super wide RHP route keys list, disabling wide RHP display for that route.
     */
    const removeSuperWideRHPRouteKey = (route: NavigationRoute) => removeWideRHPRoute(route, setAllSuperWideRHPRouteKeys);

    /**
     * Removes a route from the wide RHP route keys list, disabling wide RHP display for that route.
     */
    const removeWideRHPRouteKey = (route: NavigationRoute) => removeWideRHPRoute(route, setAllWideRHPRouteKeys);

    /**
     * Adds a route to the wide RHP route keys list, enabling wide RHP display for that route.
     */
    const showWideRHPVersion = (route: NavigationRoute) => {
        removeSuperWideRHPRouteKey(route);
        showWideRHPRoute(route, setAllWideRHPRouteKeys);
    };

    /**
     * Adds a route to the super wide RHP route keys list, enabling super wide RHP display for that route.
     */
    const showSuperWideRHPVersion = (route: NavigationRoute) => {
        removeWideRHPRouteKey(route);
        showWideRHPRoute(route, setAllSuperWideRHPRouteKeys);
    };

    /**
     * Marks a report ID as an expense report, adding it to the expense reports set.
     * This enables optimistic wide RHP display for expense reports.
     * It helps us open expense as wide, before it fully loads.
     */
    const markReportIDAsExpense = (reportID?: string) => {
        if (!reportID) {
            return;
        }
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
    };

    /**
     * Checks if a report ID is marked as an expense report.
     * Used to determine if wide RHP should be displayed optimistically.
     * It helps us open expense as wide, before it fully loads.
     */
    const isReportIDMarkedAsExpense = (reportID: string) => {
        return expenseReportIDs.has(reportID);
    };

    /**
     * Marks a report ID as a multi-transaction expense report, adding it to the expense reports set.
     * This enables optimistic super wide RHP display for expense reports.
     * It helps us open expense as super wide, before it fully loads.
     */
    const markReportIDAsMultiTransactionExpense = (reportID: string) => {
        setMultiTransactionExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.add(reportID);
            return newSet;
        });
    };

    /**
     * Removes a report ID from the multi-transaction expense reports set.
     * This disables optimistic super wide RHP display for that specific report
     * (e.g., when transactions are deleted or report no longer qualifies as multi-transaction)
     */
    const unmarkReportIDAsMultiTransactionExpense = (reportID: string) => {
        setMultiTransactionExpenseReportIDs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(reportID);
            return newSet;
        });
    };

    /**
     * Checks if a report ID is marked as a multi-transaction expense report.
     * Used to determine if super wide RHP should be displayed optimistically.
     * It helps us open expense as super wide, before it fully loads.
     */
    const isReportIDMarkedAsMultiTransactionExpense = (reportID: string) => {
        return multiTransactionExpenseReportIDs.has(reportID);
    };

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
            modalStackOverlayWideRHPPositionLeft.setValue(newSuperWideRHPWidth - newWideRHPWidth);
            modalStackOverlaySuperWideRHPPositionLeft.setValue(newSuperWideRHPWidth - singleRHPWidth);
            animatedSuperWideRHPWidth.setValue(newSuperWideRHPWidth);
        };

        // Set initial value
        handleDimensionChange();

        // Add event listener for dimension changes
        const subscription = Dimensions.addEventListener('change', handleDimensionChange);

        // Cleanup subscription on unmount
        return () => subscription?.remove();
    }, []);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue = {
        wideRHPRouteKeys,
        superWideRHPRouteKeys,
        shouldRenderSecondaryOverlayForRHPOnSuperWideRHP,
        shouldRenderSecondaryOverlayForRHPOnWideRHP,
        shouldRenderSecondaryOverlayForWideRHP,
        shouldRenderTertiaryOverlay,
        isWideRHPFocused,
        isSuperWideRHPFocused,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue = {
        showWideRHPVersion,
        showSuperWideRHPVersion,
        removeWideRHPRouteKey,
        removeSuperWideRHPRouteKey,
        markReportIDAsExpense,
        markReportIDAsMultiTransactionExpense,
        unmarkReportIDAsMultiTransactionExpense,
        isReportIDMarkedAsExpense,
        isReportIDMarkedAsMultiTransactionExpense,
        syncRHPKeys,
        clearWideRHPKeys,
        setIsWideRHPClosing,
        setIsSuperWideRHPClosing,
    };

    return (
        <WideRHPStateContext.Provider value={stateValue}>
            <WideRHPActionsContext.Provider value={actionsValue}>{children}</WideRHPActionsContext.Provider>
        </WideRHPStateContext.Provider>
    );
}

function useWideRHPState() {
    return useContext(WideRHPStateContext);
}

function useWideRHPActions() {
    return useContext(WideRHPActionsContext);
}

export default WideRHPContextProvider;

export {
    animatedReceiptPaneRHPWidth,
    animatedSuperWideRHPWidth,
    animatedWideRHPWidth,
    expandedRHPProgress,
    modalStackOverlaySuperWideRHPPositionLeft,
    modalStackOverlayWideRHPPositionLeft,
    secondOverlayWideRHPProgress,
    secondOverlayRHPOnWideRHPProgress,
    secondOverlayRHPOnSuperWideRHPProgress,
    thirdOverlayProgress,
    WideRHPStateContext,
    WideRHPActionsContext,
    useWideRHPState,
    useWideRHPActions,
};
