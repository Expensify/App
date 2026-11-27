import {renderHook} from '@testing-library/react-native';

import useRecordModalForFrameDrops from '@hooks/useRecordModalForFrameDrops';

import {clear, getTimeline, setRecording} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';

let now = 0;

beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    clear();
    setRecording(true);
});

afterEach(() => {
    setRecording(false);
    clear();
    jest.restoreAllMocks();
});

describe('useRecordModalForFrameDrops', () => {
    it('records the modal from when it becomes visible until it is hidden', () => {
        // Given a popover that is rendered hidden
        const {rerender} = renderHook(({isVisible}: {isVisible: boolean}) => useRecordModalForFrameDrops(isVisible, CONST.MODAL.MODAL_TYPE.POPOVER), {initialProps: {isVisible: false}});
        expect(getTimeline().modals).toEqual([]);

        // When it is shown and later hidden
        now = 100;
        rerender({isVisible: true});
        now = 300;
        rerender({isVisible: false});

        // Then the timeline has the modal for exactly the time it was visible
        expect(getTimeline().modals).toEqual([expect.objectContaining({name: CONST.MODAL.MODAL_TYPE.POPOVER, start: 100, end: 300})]);
    });

    it('ends the modal when it unmounts while visible', () => {
        // Given a visible modal
        now = 100;
        const {unmount} = renderHook(() => useRecordModalForFrameDrops(true, CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED));

        // When it unmounts without being hidden first
        now = 250;
        unmount();

        // Then the modal doesn't stay open on the timeline
        expect(getTimeline().modals).toEqual([expect.objectContaining({start: 100, end: 250})]);
    });
});
