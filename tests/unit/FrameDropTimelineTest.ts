import {clear, getTimeline, recordPress, recordScreen, recordScroll, setRecording} from '@libs/telemetry/frameDrops/frameDropTimeline';

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

    it('does not record presses while recording is paused', () => {
        // Given paused recording
        setRecording(false);

        // When the user presses something
        recordPress('FAB');

        // Then there is nothing to attribute frames to later
        expect(getTimeline().interactions).toEqual([]);
    });
});
