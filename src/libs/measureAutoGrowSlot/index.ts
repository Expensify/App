import type MeasureAutoGrowSlot from './types';

// Native layout cannot be read synchronously, so the slot is measured by onLayout.
const measureAutoGrowSlot: MeasureAutoGrowSlot = () => {};

export default measureAutoGrowSlot;
