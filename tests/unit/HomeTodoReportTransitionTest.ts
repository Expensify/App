import {
    finishHomeTodoReportTransition,
    homeTodoPanelOpacity,
    homeTodoPanelTranslateX,
    playHomeTodoReportExit,
    playHomeTodoReportTransition,
    registerHomeTodoReportTransition,
    resetHomeTodoReportTransition,
} from '@libs/HomeTodoReportTransition';

const ROUTE_KEY = 'report-route';
const OTHER_ROUTE_KEY = 'other-report-route';

/** Registers a screen whose exit only finishes when the test calls the returned `finishExit` */
function registerScreen(routeKey: string) {
    let pendingExit: (() => void) | undefined;
    const prepareEnter = jest.fn();
    const unregister = registerHomeTodoReportTransition(routeKey, {
        playExit: (onFinished) => {
            pendingExit = onFinished;
        },
        prepareEnter,
    });
    return {unregister, prepareEnter, finishExit: () => pendingExit?.()};
}

describe('HomeTodoReportTransition', () => {
    afterEach(() => {
        resetHomeTodoReportTransition(ROUTE_KEY);
        resetHomeTodoReportTransition(OTHER_ROUTE_KEY);
    });

    it('does not run the exit callback once the screen has unmounted', () => {
        // Given the last report of a review playing its exit
        const screen = registerScreen(ROUTE_KEY);
        const onExited = jest.fn();
        playHomeTodoReportExit(ROUTE_KEY, onExited);

        // When the user dismisses the screen before the exit ends, which cancels the animation and still fires its callback
        screen.unregister();
        screen.finishExit();

        // Then the stale callback does not return Home, because that could close a screen opened afterwards
        expect(onExited).not.toHaveBeenCalled();
    });

    it('does not open the next report once the screen has unmounted', () => {
        // Given a report swapping to the next one
        const screen = registerScreen(ROUTE_KEY);
        const showNextReport = jest.fn();
        playHomeTodoReportTransition(ROUTE_KEY, showNextReport);

        // When the screen goes away before the exit ends
        screen.unregister();
        screen.finishExit();

        // Then the review does not try to show a report on a screen that no longer exists
        expect(showNextReport).not.toHaveBeenCalled();
        expect(screen.prepareEnter).not.toHaveBeenCalled();
    });

    it('opens the next report when the exit ends on a mounted screen', () => {
        // Given a report swapping to the next one
        const screen = registerScreen(ROUTE_KEY);
        const showNextReport = jest.fn();
        playHomeTodoReportTransition(ROUTE_KEY, showNextReport);

        // When the exit ends while the screen is still mounted
        screen.finishExit();

        // Then the next report is prepared and shown, so the review moves on
        expect(screen.prepareEnter).toHaveBeenCalledTimes(1);
        expect(showNextReport).toHaveBeenCalledTimes(1);
        screen.unregister();
    });

    it('only lets the screen playing the swap put the panel back', () => {
        // Given a swap in progress that has moved the panel out of view
        const screen = registerScreen(ROUTE_KEY);
        playHomeTodoReportTransition(ROUTE_KEY, jest.fn());
        homeTodoPanelOpacity.set(0);
        homeTodoPanelTranslateX.set(-24);

        // When another report screen unmounts in the middle of it
        resetHomeTodoReportTransition(OTHER_ROUTE_KEY);

        // Then the panel stays where the swap put it, so the animation is not cut short
        expect(homeTodoPanelOpacity.get()).toBe(0);
        expect(homeTodoPanelTranslateX.get()).toBe(-24);

        // When the screen playing the swap unmounts
        resetHomeTodoReportTransition(ROUTE_KEY);

        // Then the panel is back in view, so it does not stay hidden for the next RHP screen
        expect(homeTodoPanelOpacity.get()).toBe(1);
        expect(homeTodoPanelTranslateX.get()).toBe(0);
        screen.unregister();
    });

    it('leaves the panel alone once the swap has finished', () => {
        // Given a swap that has already moved the next report in
        const screen = registerScreen(ROUTE_KEY);
        playHomeTodoReportTransition(ROUTE_KEY, jest.fn());
        finishHomeTodoReportTransition(ROUTE_KEY);
        homeTodoPanelOpacity.set(0.5);

        // When the screen unmounts later
        resetHomeTodoReportTransition(ROUTE_KEY);

        // Then it does not touch the panel, because no swap of its own is moving it
        expect(homeTodoPanelOpacity.get()).toBe(0.5);
        screen.unregister();
        homeTodoPanelOpacity.set(1);
    });
});
