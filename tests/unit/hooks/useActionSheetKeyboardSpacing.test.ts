import {renderHook} from '@testing-library/react-native';

import type * as ActionSheetAwareScrollViewContext from '@components/ActionSheetAwareScrollView/ActionSheetAwareScrollViewContext';
import useActionSheetKeyboardSpacing from '@components/ActionSheetAwareScrollView/useActionSheetKeyboardSpacing';

import type ReactModule from 'react';
import type {KeyboardHandler} from 'react-native-keyboard-controller';
import type Reanimated from 'react-native-reanimated';

import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useAnimatedRef} from 'react-native-reanimated';

import createMock from '../../utils/createMock';

const KEYBOARD_HEIGHT = 328;
const BOTTOM_SAFE_AREA = 34;

jest.mock('react-native-reanimated', () => {
    const {useRef} = jest.requireActual<typeof ReactModule>('react');
    return {
        ...jest.requireActual<typeof Reanimated>('react-native-reanimated/mock'),
        // The library mock forgets a shared value on every render and computes a derived value only once.
        useSharedValue: <Value>(initialValue: Value) => {
            const sharedValue = useRef({
                value: initialValue,
                get: () => sharedValue.current.value,
                set: (nextValue: Value) => {
                    sharedValue.current.value = nextValue;
                },
            });
            return sharedValue.current;
        },
        useDerivedValue: <Value>(compute: () => Value) => ({get: compute}),
        useScrollViewOffset: () => ({get: () => 0}),
    };
});
jest.mock('react-native-keyboard-controller', () => ({useKeyboardHandler: jest.fn()}));
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({unmodifiedPaddings: {top: 0, bottom: BOTTOM_SAFE_AREA}})));
jest.mock('@components/ActionSheetAwareScrollView/ActionSheetAwareScrollViewContext', () => {
    const actualContext = jest.requireActual<typeof ActionSheetAwareScrollViewContext>('@components/ActionSheetAwareScrollView/ActionSheetAwareScrollViewContext');
    return {
        ...actualContext,
        // The keyboard is coming back after a context menu closed, which is when the spacing follows its height.
        useActionSheetAwareScrollViewState: () => ({
            currentActionSheetState: {
                get: () => ({
                    previous: {state: actualContext.States.KEYBOARD_CLOSING_POPOVER, payload: null},
                    current: {state: actualContext.States.KEYBOARD_OPEN, payload: null},
                }),
            },
        }),
        useActionSheetAwareScrollViewActions: () => ({transitionActionSheetStateWorklet: jest.fn(), resetStateMachine: jest.fn()}),
    };
});

const mockUseKeyboardHandler = jest.mocked(useKeyboardHandler);

const createKeyboardEvent = (height: number) => createMock<Parameters<NonNullable<KeyboardHandler['onStart']>>[0]>({height, progress: height > 0 ? 1 : 0, duration: 0});

describe('useActionSheetKeyboardSpacing', () => {
    it('keeps the spacing at 0 when the open keyboard starts again', () => {
        // Given the keyboard has come back after a context menu closed, so the content no longer needs lifting.
        const {result} = renderHook(() => useActionSheetKeyboardSpacing(useAnimatedRef<Reanimated.ScrollView>()));
        const keyboardHandler = mockUseKeyboardHandler.mock.calls.at(0)?.[0];
        keyboardHandler?.onStart?.(createKeyboardEvent(KEYBOARD_HEIGHT));
        expect(result.current.get()).toBe(KEYBOARD_HEIGHT - BOTTOM_SAFE_AREA);
        keyboardHandler?.onMove?.(createKeyboardEvent(KEYBOARD_HEIGHT));
        keyboardHandler?.onEnd?.(createKeyboardEvent(KEYBOARD_HEIGHT));
        expect(result.current.get()).toBe(0);

        // When iOS reports another start for the keyboard that is already open, as it does when only its frame changes.
        keyboardHandler?.onStart?.(createKeyboardEvent(KEYBOARD_HEIGHT));

        // Then the content stays where it is. Treating the keyboard as closed again lifted the chat by its height
        // until the matching end event arrived, which showed as a flash when switching edits.
        expect(result.current.get()).toBe(0);
    });
});
