import {renderHook} from '@testing-library/react-native';

import useCanvasPanGesture from '@components/MultiGestureCanvas/useCanvasPanGesture';

import type {GestureTouchEvent, PanGestureActiveEvent, PanGestureConfig} from 'react-native-gesture-handler';

import {Dimensions} from 'react-native';
import {usePanGesture} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

import createMock from '../utils/createMock';

// The hook only hands its callbacks to usePanGesture, so the gesture is replaced with a stub that keeps the config.
// This lets each test call onTouchesMove, onUpdate and onDeactivate the way the native handler would.
const mockActivate = jest.fn<void, [number]>();
jest.mock('react-native-gesture-handler', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-gesture-handler'),
    usePanGesture: jest.fn(() => ({})),
    GestureStateManager: {activate: (handlerTag: number) => mockActivate(handlerTag)},
}));

const HANDLER_TAG = 7;
const CANVAS_SIZE = {width: 300, height: 600};
const CONTENT_SIZE = {width: 300, height: 600};
const SCREEN_HEIGHT = Dimensions.get('screen').height;

type TouchPoint = {x: number; y: number};

// The event passed to onDeactivate, taken from the config because the library does not export a name for it in every version
type PanGestureEndEvent = Parameters<NonNullable<PanGestureConfig['onDeactivate']>>[0];

type PanGestureOptions = {
    /** Scale applied to the content, where 1 means the content is fitted to the canvas */
    scale?: number;

    /** Horizontal offset left behind by an earlier pan or pinch */
    offsetX?: number;

    /** Whether the pager around the canvas is being swiped */
    isPagerScrolling?: boolean;

    /** Whether a swipe down is already in progress when the gesture is rendered */
    isSwipingDownToClose?: boolean;

    /** Called when a swipe down closes the canvas */
    onSwipeDown?: () => void;
};

/**
 * Renders the hook with working shared values and returns the config it passed to usePanGesture.
 */
function renderPanGesture({scale = 1, offsetX: initialOffsetX = 0, isPagerScrolling = false, isSwipingDownToClose: isInitiallySwipingDown = false, onSwipeDown}: PanGestureOptions = {}) {
    const {result} = renderHook(() => {
        const zoomScale = useSharedValue(scale);
        const totalScale = useSharedValue(scale);
        const offsetX = useSharedValue(initialOffsetX);
        const offsetY = useSharedValue(0);
        const panTranslateX = useSharedValue(0);
        const panTranslateY = useSharedValue(0);
        const shouldDisableTransformationGestures = useSharedValue(isPagerScrolling);
        const isSwipingDownToClose = useSharedValue(isInitiallySwipingDown);

        useCanvasPanGesture({
            canvasSize: CANVAS_SIZE,
            contentSize: CONTENT_SIZE,
            zoomScale,
            totalScale,
            offsetX,
            offsetY,
            panTranslateX,
            panTranslateY,
            shouldDisableTransformationGestures,
            stopAnimation: jest.fn(),
            isSwipingDownToClose,
            shouldDisableSwipeDownToClose: false,
            onSwipeDown,
            simultaneousWith: undefined,
        });

        return {isSwipingDownToClose, panTranslateX};
    });

    const config: PanGestureConfig | undefined = jest.mocked(usePanGesture).mock.calls.at(-1)?.[0];
    if (!config) {
        throw new Error('Expected the hook to pass a config to usePanGesture');
    }

    return {config, isSwipingDownToClose: result.current.isSwipingDownToClose, panTranslateX: result.current.panTranslateX};
}

/** Sends a touch move with one entry per finger that is currently down. */
function moveTouches(config: PanGestureConfig, touches: TouchPoint[]) {
    config.onTouchesMove?.(
        createMock<GestureTouchEvent>({
            handlerTag: HANDLER_TAG,
            numberOfTouches: touches.length,
            allTouches: touches.map((touch, id) => ({id, x: touch.x, y: touch.y, absoluteX: touch.x, absoluteY: touch.y})),
        }),
    );
}

/** Sends a pan update for a gesture that is already active. */
function updatePan(config: PanGestureConfig, event: Pick<PanGestureActiveEvent, 'numberOfPointers' | 'changeX' | 'changeY'>) {
    if (typeof config.onUpdate !== 'function') {
        throw new Error('Expected the pan gesture to have an onUpdate callback');
    }
    config.onUpdate(createMock<PanGestureActiveEvent>({...event, velocityX: 0, velocityY: 0}));
}

/** Ends the gesture the way the handler does when all fingers are lifted. */
function endPan(config: PanGestureConfig) {
    config.onDeactivate?.(createMock<PanGestureEndEvent>({}));
}

describe('useCanvasPanGesture', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('starting a swipe down to close', () => {
        it('starts a swipe down when a single finger moves down on content that is not zoomed', () => {
            // Given content that is not zoomed, where swipe down to close is available
            const {config, isSwipingDownToClose} = renderPanGesture();

            // When one finger moves down by more than the 20px the swipe needs
            moveTouches(config, [{x: 150, y: 300}]);
            moveTouches(config, [{x: 150, y: 340}]);

            // Then the swipe down starts and the pan is activated, because this is the gesture that closes the canvas
            expect(isSwipingDownToClose.get()).toBe(true);
            expect(mockActivate).toHaveBeenCalledWith(HANDLER_TAG);
        });

        it('does not start a swipe down when the first of two fingers moves down', () => {
            // Given content that is not zoomed, which is the only state where the swipe down check runs
            const {config, isSwipingDownToClose} = renderPanGesture();

            // When two fingers spread apart vertically, so the first one moves down by more than 20px while the second moves up
            moveTouches(config, [
                {x: 150, y: 320},
                {x: 150, y: 280},
            ]);
            moveTouches(config, [
                {x: 150, y: 360},
                {x: 150, y: 240},
            ]);

            // Then no swipe down starts, because two fingers moving apart are a pinch. Treating it as a swipe used to
            // leave the canvas unable to pan horizontally after a slow vertical pinch.
            expect(isSwipingDownToClose.get()).toBe(false);
            expect(mockActivate).not.toHaveBeenCalled();
        });

        it('does not start a swipe down when the finger left after a pinch is not the one that was tracked', () => {
            // Given one finger on content that is not zoomed, joined by a second finger placed lower on the screen
            const {config, isSwipingDownToClose} = renderPanGesture();
            moveTouches(config, [{x: 150, y: 300}]);
            moveTouches(config, [
                {x: 150, y: 300},
                {x: 150, y: 500},
            ]);

            // When the first finger is lifted, so the lower finger is the only one left and has not moved
            moveTouches(config, [{x: 150, y: 500}]);

            // Then no swipe down starts. The position recorded for the first finger is forgotten during the pinch, so the
            // remaining finger is not mistaken for one that travelled 200px down.
            expect(isSwipingDownToClose.get()).toBe(false);
            expect(mockActivate).not.toHaveBeenCalled();
        });
    });

    describe('ending a swipe down to close', () => {
        it('ends the swipe down when the gesture finishes without having moved the content', () => {
            // Given a swipe down that started on content that is not zoomed
            const {config, isSwipingDownToClose} = renderPanGesture();
            moveTouches(config, [{x: 150, y: 300}]);
            moveTouches(config, [{x: 150, y: 340}]);
            expect(isSwipingDownToClose.get()).toBe(true);

            // When the gesture ends before any pan update moved the content
            endPan(config);

            // Then the swipe down is over. No snap-back animation runs when the content has not moved, so the gesture has
            // to end the swipe itself, otherwise horizontal panning stays blocked.
            expect(isSwipingDownToClose.get()).toBe(false);
        });

        it('ends the swipe down when the gesture finishes with the content inside its vertical bounds', () => {
            // Given zoomed content that was panned sideways and stayed inside its bounds, with a swipe down still marked as in progress
            const {config, isSwipingDownToClose} = renderPanGesture({scale: 2, offsetX: 10, isSwipingDownToClose: true});

            // When the gesture ends, which is the last point where a swipe left in progress can be cleared
            endPan(config);

            // Then the swipe down is over, because content inside its vertical bounds does not run the snap-back
            // animation that would otherwise end it
            expect(isSwipingDownToClose.get()).toBe(false);
        });

        it('ends the swipe down when the gesture finishes while the pager is being swiped', () => {
            // Given a swipe down still marked as in progress while the pager around the canvas is being swiped
            const {config, isSwipingDownToClose} = renderPanGesture({isPagerScrolling: true, isSwipingDownToClose: true});

            // When the gesture ends, which is the last point where a swipe left in progress can be cleared
            endPan(config);

            // Then the swipe down is over, because the gesture skips returning the content to its bounds while the pager
            // is being swiped
            expect(isSwipingDownToClose.get()).toBe(false);
        });

        it('closes the canvas when a single finger swipes far enough down', async () => {
            // Given a swipe down that started on content that is not zoomed
            const onSwipeDown = jest.fn();
            const {config, isSwipingDownToClose} = renderPanGesture({onSwipeDown});
            moveTouches(config, [{x: 150, y: 300}]);
            moveTouches(config, [{x: 150, y: 340}]);

            // When the finger drags the content down by a full screen height and the gesture ends
            updatePan(config, {numberOfPointers: 1, changeX: 0, changeY: SCREEN_HEIGHT});
            endPan(config);
            await Promise.resolve();

            // Then the canvas is closed and the swipe down is over, so the one-finger gesture keeps working
            expect(onSwipeDown).toHaveBeenCalledTimes(1);
            expect(isSwipingDownToClose.get()).toBe(false);
        });
    });

    describe('panning after a pinch', () => {
        it('pans the content horizontally after two fingers spread apart vertically', () => {
            // Given content that is not zoomed, on which two fingers spread apart vertically, as at the start of a pinch
            const {config, panTranslateX} = renderPanGesture();
            moveTouches(config, [
                {x: 150, y: 320},
                {x: 150, y: 280},
            ]);
            moveTouches(config, [
                {x: 150, y: 360},
                {x: 150, y: 240},
            ]);
            endPan(config);

            // When one finger then drags sideways
            updatePan(config, {numberOfPointers: 1, changeX: 25, changeY: 0});

            // Then the content follows the finger, which is what the stuck swipe down used to prevent
            expect(panTranslateX.get()).toBe(25);
        });
    });
});
