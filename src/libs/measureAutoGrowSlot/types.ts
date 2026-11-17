import type {HostInstance} from 'react-native';

/**
 * Reads the height of an auto-grow input's slot before the first paint, where the platform allows it, and reports it through the callback.
 */
type MeasureAutoGrowSlot = (slot: HostInstance | null, callback: (slotHeight: number) => void) => void;

export default MeasureAutoGrowSlot;
