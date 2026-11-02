import {act, renderHook} from '@testing-library/react-native';

import useExpandedSystemMessageFocus from '@pages/inbox/report/useExpandedSystemMessageFocus';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import createMock from '../utils/createMock';

type Props = {id: string; onReady?: (target: ComponentRef<typeof View> | null) => void};

describe('expanded system message host lifecycle', () => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameID = 0;
    let frameSpy: jest.SpyInstance;
    let cancelSpy: jest.SpyInstance;

    beforeEach(() => {
        frames.clear();
        frameID = 0;
        frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            frames.set(++frameID, callback);
            return frameID;
        });
        cancelSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => {
            if (typeof id !== 'number') {
                return;
            }
            frames.delete(id);
        });
    });

    afterEach(() => {
        frameSpy.mockRestore();
        cancelSpy.mockRestore();
    });

    it('hands off an already-mounted host after its row becomes the first revealed update, without another layout', () => {
        const target = createMock<ComponentRef<typeof View>>({focus: jest.fn()});
        const targetRef = {current: target};
        const onReady = jest.fn();
        const {rerender, unmount} = renderHook<void, Props>(({id, onReady: ready}: Props) => useExpandedSystemMessageFocus(id, targetRef, ready), {initialProps: {id: 'ordinary-row'}});
        expect(frames.size).toBe(0);

        rerender({id: 'revealed-oldest', onReady});
        expect(onReady).not.toHaveBeenCalled();
        act(() => {
            for (const callback of [...frames.values()]) {
                callback(0);
            }
        });
        expect(onReady).toHaveBeenCalledTimes(1);
        expect(onReady).toHaveBeenCalledWith(target);
        unmount();
    });

    it.each(['reassignment', 'unmount'])('cancels a handoff before the next frame on %s', (change) => {
        const targetRef = {current: createMock<ComponentRef<typeof View>>({focus: jest.fn()})};
        const onReady = jest.fn();
        const {rerender, unmount} = renderHook<void, Props>(({id, onReady: ready}: Props) => useExpandedSystemMessageFocus(id, targetRef, ready), {
            initialProps: {id: 'revealed-oldest', onReady},
        });
        expect(frames.size).toBe(1);
        if (change === 'reassignment') {
            rerender({id: 'another-message'});
        } else {
            unmount();
        }
        act(() => {
            for (const callback of [...frames.values()]) {
                callback(0);
            }
        });
        expect(onReady).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
        if (change === 'reassignment') {
            unmount();
        }
    });
});
