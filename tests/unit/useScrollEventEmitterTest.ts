import {renderHook} from '@testing-library/react-native';

import useScrollEventEmitter from '@hooks/useScrollEventEmitter';

import CONST from '@src/CONST';

import {DeviceEventEmitter} from 'react-native';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('useScrollEventEmitter', () => {
    it('ends the scroll when the list unmounts while scrolling', () => {
        // Given a list that is scrolling
        const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
        const {result, unmount} = renderHook(() => useScrollEventEmitter());
        result.current();

        // When the list unmounts before the scroll end timeout fires
        unmount();
        jest.runAllTimers();

        // Then listeners are told the scroll ended, exactly once
        expect(emitSpy.mock.calls).toEqual([
            [CONST.EVENTS.SCROLLING, true],
            [CONST.EVENTS.SCROLLING, false],
        ]);
    });

    it('does not emit anything on unmount when the list is not scrolling', () => {
        // Given a list that never scrolled
        const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
        const {unmount} = renderHook(() => useScrollEventEmitter());

        // When it unmounts
        unmount();

        // Then no scroll event is emitted
        expect(emitSpy).not.toHaveBeenCalled();
    });
});
