import {makeMutable} from 'react-native-reanimated';

/**
 * Plays the swap between two reports of a Home to-do review. The whole RHP panel fades and slides out, then fades and
 * slides back in with the next report, so the user can see that one report left and another arrived. The report screen
 * registers how to play it, and the RHP frame reads the panel values below.
 */

/** Opacity of the RHP panel, lowered only while it swaps reports */
const homeTodoPanelOpacity = makeMutable(1);

/** Horizontal offset of the RHP panel, moved only while it swaps reports */
const homeTodoPanelTranslateX = makeMutable(0);

type HomeTodoReportTransitionHandler = {
    /** Moves the current report out after `delay` ms and calls `onFinished` once it is gone */
    playExit: (onFinished: () => void, delay: number) => void;

    /** Keeps the panel out of view, so the next report moves in when the screen renders it */
    prepareEnter: () => void;
};

const handlers = new Map<string, HomeTodoReportTransitionHandler>();

/** The report screen whose swap is moving the panel right now. Only it may put the panel back when it unmounts. */
let activeRouteKey: string | undefined;

function registerHomeTodoReportTransition(routeKey: string, handler: HomeTodoReportTransitionHandler) {
    handlers.set(routeKey, handler);
    return () => {
        if (handlers.get(routeKey) !== handler) {
            return;
        }
        handlers.delete(routeKey);
    };
}

/**
 * Swaps the report screen with `routeKey` to another report. `holdDuration` keeps the current report on screen a bit
 * longer, so the user sees the result of the action first. A report hidden behind another screen swaps without an
 * animation, because moving the panel would move the screen on top of it too.
 */
function playHomeTodoReportTransition(routeKey: string, showNextReport: () => void, {isFocused = true, holdDuration = 0}: {isFocused?: boolean; holdDuration?: number} = {}) {
    const handler = handlers.get(routeKey);
    if (!handler || !isFocused) {
        showNextReport();
        return;
    }

    activeRouteKey = routeKey;
    handler.playExit(() => {
        // The exit also ends when the screen unmounts, and a screen that is gone must not open another report.
        const currentHandler = handlers.get(routeKey);
        if (!currentHandler) {
            return;
        }
        currentHandler.prepareEnter();
        showNextReport();
    }, holdDuration);
}

/**
 * Moves the report screen with `routeKey` out without bringing another report in, for the last report of the review.
 * The panel stays out of view until the screen unmounts, so `onExited` should close it.
 */
function playHomeTodoReportExit(routeKey: string, onExited: () => void, {isFocused = true, holdDuration = 0}: {isFocused?: boolean; holdDuration?: number} = {}) {
    const handler = handlers.get(routeKey);
    if (!handler || !isFocused) {
        onExited();
        return;
    }

    activeRouteKey = routeKey;
    handler.playExit(() => {
        // The exit also ends when the screen unmounts, and a screen that is gone must not close whatever is open now.
        if (!handlers.has(routeKey)) {
            return;
        }
        onExited();
    }, holdDuration);
}

/** Marks the swap of the report screen with `routeKey` as done, once the next report has moved in */
function finishHomeTodoReportTransition(routeKey: string) {
    if (activeRouteKey !== routeKey) {
        return;
    }
    activeRouteKey = undefined;
}

/**
 * Puts the panel back in view when the report screen with `routeKey` goes away mid-swap. Other screens leave it alone,
 * so a report screen unmounting elsewhere does not cut into a swap that is still playing.
 */
function resetHomeTodoReportTransition(routeKey: string) {
    if (activeRouteKey !== routeKey) {
        return;
    }
    activeRouteKey = undefined;
    homeTodoPanelOpacity.set(1);
    homeTodoPanelTranslateX.set(0);
}

export {
    registerHomeTodoReportTransition,
    playHomeTodoReportTransition,
    playHomeTodoReportExit,
    finishHomeTodoReportTransition,
    resetHomeTodoReportTransition,
    homeTodoPanelOpacity,
    homeTodoPanelTranslateX,
};
