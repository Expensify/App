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
import arraysEqual from '@src/utils/arraysEqual';

import type {OnyxCollection} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import React, {createContext, useContext, useEffect, useLayoutEffect, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions} from 'react-native';

import type {RHPWidth, RHPWidthHint, WideRHPActionsContextType, WideRHPStateContextType} from './types';

import {defaultWideRHPActionsContextValue, defaultWideRHPStateContextValue} from './default';
import getIsRHPDisplayedBelow from './getIsRHPDisplayedBelow';
import getVisibleRHPKeys from './getVisibleRHPRouteKeys';
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

const NO_VISIBLE_RHP_ROUTE_KEYS: string[] = [];

let visibleRHPRouteKeys: {wide: string[]; superWide: string[]} = {wide: NO_VISIBLE_RHP_ROUTE_KEYS, superWide: NO_VISIBLE_RHP_ROUTE_KEYS};
const visibleRHPRouteKeysListeners = new Set<() => void>();

function setVisibleRHPRouteKeysSnapshot(wide: string[], superWide: string[]) {
    // Compared by content, since the keys are re-derived into fresh arrays on every navigation event and every subscriber is a mounted screen.
    if (arraysEqual(visibleRHPRouteKeys.wide, wide) && arraysEqual(visibleRHPRouteKeys.superWide, superWide)) {
        return;
    }
    visibleRHPRouteKeys = {wide, superWide};
    for (const listener of visibleRHPRouteKeysListeners) {
        listener();
    }
}

function subscribeToVisibleRHPRouteKeys(listener: () => void): () => void {
    visibleRHPRouteKeysListeners.add(listener);
    return () => visibleRHPRouteKeysListeners.delete(listener);
}

/** Returns a primitive, so `useSyncExternalStore` subscribers compare snapshots without tearing. */
function getVisibleRHPRouteWidth(routeKey: string | undefined): Exclude<RHPWidth, 'narrow'> | undefined {
    if (!routeKey) {
        return undefined;
    }
    if (visibleRHPRouteKeys.superWide.includes(routeKey)) {
        return 'super-wide';
    }
    if (visibleRHPRouteKeys.wide.includes(routeKey)) {
        return 'wide';
    }
    return undefined;
}

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

/** One entry per route registered at a non-narrow width, newest first, so a route holds at most one width by construction. */
type RHPWidthRegistration = {
    key: string;
    width: RHPWidthHint;
};

/** Route keys the navigation state has shown at least once. */
const seenRHPRouteKeys = new Set<string>();

/** Re-registering the same width is a no-op, so a route keeps its place unless its width actually changes. */
function registerRHPRouteWidth(registrations: RHPWidthRegistration[], routeKey: string, width: RHPWidth): RHPWidthRegistration[] {
    const existing = registrations.find((registration) => registration.key === routeKey);
    if (existing?.width === width) {
        return registrations;
    }
    if (!existing && width === 'narrow') {
        return registrations;
    }
    const withoutRoute = existing ? registrations.filter((registration) => registration.key !== routeKey) : registrations;
    return width === 'narrow' ? withoutRoute : [{key: routeKey, width}, ...withoutRoute];
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
    // The only stored width state, since which registrations are on screen is derived from navigation state below.
    const [rhpWidthRegistrations, setRHPWidthRegistrations] = useState<RHPWidthRegistration[]>([]);

    // A reportID maps to at most one hint, making "wide vs super-wide" structurally mutually exclusive.
    const [reportRHPWidthHints, setReportRHPWidthHints] = useState<Map<string, RHPWidthHint>>(() => new Map());

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: expenseReportSelector,
    });

    const {focusedRoute, focusedNavigator, rootNavigationState} = useRootNavigationState((state) => {
        if (!state) {
            return {focusedRoute: undefined, focusedNavigator: undefined, rootNavigationState: undefined};
        }

        return {
            focusedRoute: findFocusedRoute(state),
            focusedNavigator: state.routes.at(-1)?.name,
            rootNavigationState: state,
        };
    });

    const allWideRHPRouteKeys = rhpWidthRegistrations.filter((registration) => registration.width === 'wide').map((registration) => registration.key);
    const allSuperWideRHPRouteKeys = rhpWidthRegistrations.filter((registration) => registration.width === 'super-wide').map((registration) => registration.key);
    const {visibleWideRHPRouteKeys, visibleSuperWideRHPRouteKeys, presentRouteKeys} = getVisibleRHPKeys(rootNavigationState, allWideRHPRouteKeys, allSuperWideRHPRouteKeys, seenRHPRouteKeys);

    const isWideRHPFocused = !!focusedRoute?.key && allWideRHPRouteKeys.includes(focusedRoute.key);
    const isSuperWideRHPFocused = !!focusedRoute?.key && allSuperWideRHPRouteKeys.includes(focusedRoute.key);

    const isRHPFocused = focusedNavigator === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    // Whether Wide RHP is displayed below the currently displayed screen
    const {isWideRHPBelow, isSuperWideRHPBelow} = getIsRHPDisplayedBelow(focusedRoute?.key, visibleSuperWideRHPRouteKeys, visibleWideRHPRouteKeys);

    // Layout effect so the animated width and per-route subscribers see the flip before paint, same as context consumers do.
    useLayoutEffect(() => {
        // Recorded after the commit, so the derivation stays pure.
        for (const key of presentRouteKeys) {
            seenRHPRouteKeys.add(key);
        }
        // An unregistered key can never dismiss again, so dropping it bounds the set.
        const registeredKeys = new Set([...allWideRHPRouteKeys, ...allSuperWideRHPRouteKeys]);
        for (const key of seenRHPRouteKeys) {
            if (registeredKeys.has(key)) {
                continue;
            }
            seenRHPRouteKeys.delete(key);
        }
        setExpandedRHPProgress(visibleSuperWideRHPRouteKeys, visibleWideRHPRouteKeys);
        setVisibleRHPRouteKeysSnapshot(visibleWideRHPRouteKeys, visibleSuperWideRHPRouteKeys);
    }, [visibleWideRHPRouteKeys, visibleSuperWideRHPRouteKeys, presentRouteKeys, allWideRHPRouteKeys, allSuperWideRHPRouteKeys]);

    /**
     * Effect that empties the module-level snapshot on teardown, since it outlives the provider and would otherwise answer for the next session.
     */
    useEffect(() => () => setVisibleRHPRouteKeysSnapshot(NO_VISIBLE_RHP_ROUTE_KEYS, NO_VISIBLE_RHP_ROUTE_KEYS), []);

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

    /** Removes the route's registration. Used on screen unmount. */
    const removeRHPRouteKey = (route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to removeRHPRouteKey should have the "key" property defined.`);
            return;
        }
        const routeKey = route.key;
        setRHPWidthRegistrations((previousRegistrations) => registerRHPRouteWidth(previousRegistrations, routeKey, 'narrow'));
    };

    /** Single entry point for setting a route's RHP width, in one atomic write. */
    const setRHPWidth = (route: NavigationRoute, width: RHPWidth) => {
        if (!route.key) {
            console.error(`The route passed to setRHPWidth should have the "key" property defined.`);
            return;
        }
        const routeKey = route.key;
        setRHPWidthRegistrations((previousRegistrations) => registerRHPRouteWidth(previousRegistrations, routeKey, width));
    };

    /**
     * Sets an optimistic width hint for a reportID before its screen renders, so the right width is
     * registered on first paint. Invoices and tasks are excluded from the 'wide' hint. The latest mark wins,
     * since the screen that consumes a hint keeps it as its own floor, so a later mark cannot narrow it.
     */
    const markReportRHPWidth = (reportID: string | undefined, width: RHPWidthHint) => {
        if (!reportID) {
            return;
        }
        if (width === 'wide') {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            if (report?.type === CONST.REPORT.TYPE.INVOICE || report?.type === CONST.REPORT.TYPE.TASK) {
                return;
            }
        }
        setReportRHPWidthHints((prev) => {
            if (prev.get(reportID) === width) {
                return prev;
            }
            const next = new Map(prev);
            next.set(reportID, width);
            return next;
        });
    };

    /**
     * Clears the optimistic width hint for a reportID. Pass `width` to clear only when it matches the
     * current hint; omit to clear unconditionally. Called when a report no longer qualifies for a hint.
     */
    const unmarkReportRHPWidth = (reportID: string, width?: RHPWidthHint) => {
        setReportRHPWidthHints((prev) => {
            const current = prev.get(reportID);
            if (current === undefined) {
                return prev;
            }
            if (width !== undefined && current !== width) {
                return prev;
            }
            const next = new Map(prev);
            next.delete(reportID);
            return next;
        });
    };

    const getReportRHPWidthHint = (reportID: string): RHPWidthHint | undefined => reportRHPWidthHints.get(reportID);

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
        wideRHPRouteKeys: visibleWideRHPRouteKeys,
        superWideRHPRouteKeys: visibleSuperWideRHPRouteKeys,
        shouldRenderSecondaryOverlayForRHPOnSuperWideRHP,
        shouldRenderSecondaryOverlayForRHPOnWideRHP,
        shouldRenderSecondaryOverlayForWideRHP,
        shouldRenderTertiaryOverlay,
        isWideRHPFocused,
        isSuperWideRHPFocused,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue: WideRHPActionsContextType = {
        setRHPWidth,
        removeRHPRouteKey,
        markReportRHPWidth,
        unmarkReportRHPWidth,
        getReportRHPWidthHint,
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
    useWideRHPState,
    useWideRHPActions,
    subscribeToVisibleRHPRouteKeys,
    getVisibleRHPRouteWidth,
};
export type {RHPWidth} from './types';
