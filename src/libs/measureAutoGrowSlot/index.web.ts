import type MeasureAutoGrowSlot from './types';

// react-native-web reports the first onLayout after the browser has painted, but the slot is already laid out while layout effects run.
// A slot that is not laid out yet, such as one inside a hidden screen, reports 0 and is left to onLayout.
const measureAutoGrowSlot: MeasureAutoGrowSlot = (slot, callback) => {
    if (!(slot instanceof HTMLElement) || slot.offsetHeight === 0) {
        return;
    }
    callback(slot.offsetHeight);
};

export default measureAutoGrowSlot;
