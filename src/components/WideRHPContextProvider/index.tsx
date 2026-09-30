import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';

import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import type {NavigationRoute} from '@libs/Navigation/types';

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
import {markPendingRHPWidth} from './pendingRHPWidths';
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
const superWideRHPWidth = calculateSuperWideRHPWidth(Dimensions.get('window').width);
const wideRHPWidth = calculateWideRHPWidth(Dimensions.get('window').width);

// This animated value is necessary to have responsive RHP widths
const animatedReceiptPaneRHPWidth = new Animated.Value(receiptPaneRHPWidth);
const animatedSuperWideRHPWidth = new Animated.Value(superWideRHPWidth);
const animatedWideRHPWidth = new Animated.Value(wideRHPWidth);

type RHPRouteKeys = {wide: string[]; superWide: string[]};

const NO_RHP_ROUTE_KEYS: RHPRouteKeys = {wide: [], superWide: []};

/** `width` includes a screen animating out; `displayed` does not. */
let rhpRouteKeys: {width: RHPRouteKeys; displayed: RHPRouteKeys} = {width: NO_RHP_ROUTE_KEYS, displayed: NO_RHP_ROUTE_KEYS};
const rhpRouteKeysListeners = new Set<() => void>();

function areRHPRouteKeysEqual(a: RHPRouteKeys, b: RHPRouteKeys): boolean {
    return arraysEqual(a.wide, b.wide) && arraysEqual(a.superWide, b.superWide);
}

function setRHPRouteKeysSnapshot(width: RHPRouteKeys, displayed: RHPRouteKeys) {
    // Compared by content, since the arrays are rebuilt on every navigation event.
    if (areRHPRouteKeysEqual(rhpRouteKeys.width, width) && areRHPRouteKeysEqual(rhpRouteKeys.displayed, displayed)) {
        return;
    }
    rhpRouteKeys = {width, displayed};
    for (const listener of rhpRouteKeysListeners) {
        listener();
    }
}

function subscribeToRHPRouteKeys(listener: () => void): () => void {
    rhpRouteKeysListeners.add(listener);
    return () => rhpRouteKeysListeners.delete(listener);
}

/** A primitive, so `useSyncExternalStore` snapshots compare by value. */
function findRHPRouteWidth(keys: RHPRouteKeys, routeKey: string | undefined): Exclude<RHPWidth, 'narrow'> | undefined {
    if (!routeKey) {
        return undefined;
    }
    if (keys.superWide.includes(routeKey)) {
        return 'super-wide';
    }
    if (keys.wide.includes(routeKey)) {
        return 'wide';
    }
    return undefined;
}

/** For layout: kept while the screen animates out, so it doesn't reflow as it leaves. */
function getRHPRouteWidth(routeKey: string | undefined): Exclude<RHPWidth, 'narrow'> | undefined {
    return findRHPRouteWidth(rhpRouteKeys.width, routeKey);
}

/** For visibility: `undefined` once the screen starts animating out. */
function getDisplayedRHPRouteWidth(routeKey: string | undefined): Exclude<RHPWidth, 'narrow'> | undefined {
    return findRHPRouteWidth(rhpRouteKeys.displayed, routeKey);
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

/** One entry per route wider than narrow, newest first. */
type RHPWidthRegistration = {
    key: string;
    width: RHPWidthHint;
};

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
    // The only stored width state. What is on screen is derived from navigation below.
    const [rhpWidthRegistrations, setRHPWidthRegistrations] = useState<RHPWidthRegistration[]>([]);

    // In state because the derivation reads it during render, so it must get a new identity when it changes.
    const [seenRHPRouteKeys, setSeenRHPRouteKeys] = useState<ReadonlyMap<string, string>>(() => new Map());

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
    const derivedKeys = getVisibleRHPKeys(rootNavigationState, allWideRHPRouteKeys, allSuperWideRHPRouteKeys, seenRHPRouteKeys);

    // Held in state to keep the arrays' identity while their contents are unchanged, so consumers don't re-render on every navigation event.
    const [publishedKeys, setPublishedKeys] = useState(derivedKeys);
    const hasSameKeys =
        arraysEqual(publishedKeys.widthWideRHPRouteKeys, derivedKeys.widthWideRHPRouteKeys) &&
        arraysEqual(publishedKeys.widthSuperWideRHPRouteKeys, derivedKeys.widthSuperWideRHPRouteKeys) &&
        arraysEqual(publishedKeys.displayedWideRHPRouteKeys, derivedKeys.displayedWideRHPRouteKeys) &&
        arraysEqual(publishedKeys.displayedSuperWideRHPRouteKeys, derivedKeys.displayedSuperWideRHPRouteKeys);
    if (!hasSameKeys) {
        setPublishedKeys(derivedKeys);
    }
    const {widthWideRHPRouteKeys, widthSuperWideRHPRouteKeys, displayedWideRHPRouteKeys, displayedSuperWideRHPRouteKeys} = hasSameKeys ? publishedKeys : derivedKeys;

    // Updated during render so the derivation is not a commit behind. Unregistered keys are dropped, since they can no longer be dismissing.
    const registeredRouteKeys = new Set([...allWideRHPRouteKeys, ...allSuperWideRHPRouteKeys]);
    const nextSeenRHPRouteKeys = new Map([...seenRHPRouteKeys, ...derivedKeys.presentRouteEntries].filter(([routeKey]) => registeredRouteKeys.has(routeKey)));
    const hasSameSeenKeys =
        nextSeenRHPRouteKeys.size === seenRHPRouteKeys.size && [...nextSeenRHPRouteKeys].every(([routeKey, rhpRouteKey]) => seenRHPRouteKeys.get(routeKey) === rhpRouteKey);
    if (!hasSameSeenKeys) {
        setSeenRHPRouteKeys(nextSeenRHPRouteKeys);
    }

    const isWideRHPFocused = !!focusedRoute?.key && allWideRHPRouteKeys.includes(focusedRoute.key);
    const isSuperWideRHPFocused = !!focusedRoute?.key && allSuperWideRHPRouteKeys.includes(focusedRoute.key);

    const isRHPFocused = focusedNavigator === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    // Whether Wide RHP is displayed below the currently displayed screen. From the displayed keys, since a leaving screen is below nothing.
    const {isWideRHPBelow, isSuperWideRHPBelow} = getIsRHPDisplayedBelow(focusedRoute?.key, displayedSuperWideRHPRouteKeys, displayedWideRHPRouteKeys);

    // Layout effects, so the animated width and per-route subscribers update before paint.
    useLayoutEffect(() => {
        setExpandedRHPProgress(widthSuperWideRHPRouteKeys, widthWideRHPRouteKeys);
    }, [widthWideRHPRouteKeys, widthSuperWideRHPRouteKeys]);
    useLayoutEffect(() => {
        setRHPRouteKeysSnapshot({wide: widthWideRHPRouteKeys, superWide: widthSuperWideRHPRouteKeys}, {wide: displayedWideRHPRouteKeys, superWide: displayedSuperWideRHPRouteKeys});
    }, [widthWideRHPRouteKeys, widthSuperWideRHPRouteKeys, displayedWideRHPRouteKeys, displayedSuperWideRHPRouteKeys]);

    // Both outlive the provider, so they are reset for the next session.
    useEffect(
        () => () => {
            setRHPRouteKeysSnapshot(NO_RHP_ROUTE_KEYS, NO_RHP_ROUTE_KEYS);
            expandedRHPProgress.setValue(0);
        },
        [],
    );

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
    // react-navigation's card wrapper swallows clicks on the dimmed area, so the overlay from the screen below can't catch them when a skinny RHP sits over a wide or super wide one.
    const shouldRenderTertiaryOverlay = useShouldRenderOverlay(isRHPFocused && (isWideRHPBelow || isSuperWideRHPBelow), thirdOverlayProgress);

    const removeRHPRouteKey = (route: NavigationRoute) => {
        if (!route.key) {
            console.error(`The route passed to removeRHPRouteKey should have the "key" property defined.`);
            return;
        }
        const routeKey = route.key;
        setRHPWidthRegistrations((previousRegistrations) => registerRHPRouteWidth(previousRegistrations, routeKey, 'narrow'));
    };

    const setRHPWidth = (route: NavigationRoute, width: RHPWidth) => {
        if (!route.key) {
            console.error(`The route passed to setRHPWidth should have the "key" property defined.`);
            return;
        }
        const routeKey = route.key;
        setRHPWidthRegistrations((previousRegistrations) => registerRHPRouteWidth(previousRegistrations, routeKey, width));
    };

    /** Leaves a width for the screen this press opens, until its own data can say. Invoices and tasks are never marked wide, and the latest mark wins. */
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
        markPendingRHPWidth(reportID, width);
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
            const newWideRHPWidth = calculateWideRHPWidth(windowWidth);
            animatedReceiptPaneRHPWidth.setValue(newReceiptPaneRHPWidth);
            animatedWideRHPWidth.setValue(newWideRHPWidth);
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
        wideRHPRouteKeys: widthWideRHPRouteKeys,
        superWideRHPRouteKeys: widthSuperWideRHPRouteKeys,
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
    secondOverlayWideRHPProgress,
    secondOverlayRHPOnWideRHPProgress,
    secondOverlayRHPOnSuperWideRHPProgress,
    thirdOverlayProgress,
    useWideRHPState,
    useWideRHPActions,
    subscribeToRHPRouteKeys,
    getRHPRouteWidth,
    getDisplayedRHPRouteWidth,
};
export type {RHPWidth} from './types';
