import type {ShiftClickEvent} from './types';

function getShiftKeyFromEvent(event?: Partial<ShiftClickEvent> | null): boolean {
    return !!(event?.shiftKey ?? event?.nativeEvent?.shiftKey);
}

export default getShiftKeyFromEvent;
