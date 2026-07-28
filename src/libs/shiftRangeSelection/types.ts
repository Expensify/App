type ShiftRangeBatch<TItem> = {
    toSelect: TItem[];
    toDeselect: TItem[];
};

/** Minimal shape read by `getShiftKeyFromEvent` — any native / RN-Web / DOM press event is assignable, and Shift may sit on `nativeEvent`. */
type ShiftClickEvent = {shiftKey?: boolean; nativeEvent?: unknown};

export type {ShiftRangeBatch, ShiftClickEvent};
