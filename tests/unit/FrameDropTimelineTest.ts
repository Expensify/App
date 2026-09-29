import {clear, getTimeline, recordPress, recordScreen, setRecording} from '@libs/telemetry/frameDrops/frameDropTimeline';

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

    it('does not record presses while recording is paused', () => {
        // Given paused recording
        setRecording(false);

        // When the user presses something
        recordPress('FAB');

        // Then there is nothing to attribute frames to later
        expect(getTimeline().interactions).toEqual([]);
    });
});
