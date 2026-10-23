import {clear, endModal, getTimeline, recordNavigationStart, recordPress, recordScreen, recordScroll, setRecording, startModal} from '@libs/telemetry/frameDrops/frameDropTimeline';

let now = 0;

beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    clear();
});

afterEach(() => {
    setRecording(false);
    clear();
    jest.restoreAllMocks();
});

describe('frameDropTimeline', () => {
    it('restores the screen that was opened while recording was paused', () => {
        // Given a navigation that happened while the app was inactive, e.g. behind a permission prompt
        setRecording(false);
        recordScreen('Home');

        // When recording resumes
        now = 500;
        setRecording(true);

        // Then frames after resuming are attributed to that screen instead of to no screen at all
        expect(getTimeline().screens).toEqual([{time: 500, screen: 'Home'}]);
    });

    it('keeps the scroll going until the last scrolling list stops', () => {
        // Given two lists that scroll at the same time
        setRecording(true);
        recordScroll(true);
        now = 100;
        recordScroll(true);

        // When the first one stops
        now = 200;
        recordScroll(false);

        // Then the scroll is still open, and it ends only when the second one stops too
        expect(getTimeline().interactions.at(0)?.end).toBeUndefined();
        now = 300;
        recordScroll(false);
        expect(getTimeline().interactions.at(0)?.end).toBe(300);
    });

    it('gives the new screen the frames from the navigation action on, including its mount and enter animation', () => {
        // Given a recorded screen, and a navigation action dispatched at 1000ms
        setRecording(true);
        recordScreen('Home');
        now = 1_000;
        recordNavigationStart();

        // When the navigation state updates after the new screen mounted
        now = 1_400;
        recordScreen('Report');

        // Then the screen change is backdated to the navigation action
        expect(getTimeline().screens.at(-1)).toEqual({time: 1_000, screen: 'Report'});
    });

    it('does not backdate a screen change to a navigation action that is too old', () => {
        // Given a navigation action long before the next screen change, e.g. one that didn't change the screen
        setRecording(true);
        recordScreen('Home');
        now = 1_000;
        recordNavigationStart();

        // When a screen change is recorded much later
        now = 10_000;
        recordScreen('Report');

        // Then it is recorded at the time it happened
        expect(getTimeline().screens.at(-1)).toEqual({time: 10_000, screen: 'Report'});
    });

    it('records a modal while it is shown', () => {
        // Given recording is on
        setRecording(true);

        // When a popover is shown and hidden
        now = 100;
        const modalID = startModal('popover');
        now = 400;
        endModal(modalID);

        // Then its interval is on the timeline
        expect(getTimeline().modals).toEqual([{id: modalID, name: 'popover', start: 100, end: 400}]);
    });

    it('does not record presses while recording is paused', () => {
        // Given paused recording
        setRecording(false);

        // When the user presses something
        recordPress('FAB');

        // Then there is nothing to attribute frames to later
        expect(getTimeline().interactions).toEqual([]);
    });
});
