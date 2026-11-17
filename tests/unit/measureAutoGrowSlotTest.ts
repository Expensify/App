import measureAutoGrowSlotWeb from '@libs/measureAutoGrowSlot/index.web';

import type {HostInstance} from 'react-native';

function createSlot(offsetHeight: number) {
    const slot = document.createElement('div');
    Object.defineProperty(slot, 'offsetHeight', {value: offsetHeight});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web hands the ref over as the DOM element, so a div stands in for the host instance here
    return slot as unknown as HostInstance;
}

describe('measureAutoGrowSlot on web', () => {
    it('reports the slot height synchronously', () => {
        // Given a slot that the browser has already laid out at 545px
        const callback = jest.fn();

        // When the container measures it in its mount layout effect
        measureAutoGrowSlotWeb(createSlot(545), callback);

        // Then the height arrives before the first paint, so a long value never paints at the default cap
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(545);
    });

    it('leaves a slot that is not laid out to onLayout', () => {
        // Given a slot in a hidden screen, which the browser reports as 0px tall, and a ref that is not attached yet
        const callback = jest.fn();

        // When the container tries to measure them
        measureAutoGrowSlotWeb(createSlot(0), callback);
        measureAutoGrowSlotWeb(null, callback);

        // Then no height is reported, so the cap is not shrunk to one row by a slot that has no size yet
        expect(callback).not.toHaveBeenCalled();
    });
});
