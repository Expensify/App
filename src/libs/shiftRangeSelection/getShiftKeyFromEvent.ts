import type {ShiftClickEvent} from './types';

function getShiftKeyFromEvent(event?: ShiftClickEvent | null): boolean {
    // An explicit outer shiftKey (true or false) wins; fall back to nativeEvent only when it's absent.
    const outerShiftKey = event?.shiftKey;
    if (outerShiftKey != null) {
        return outerShiftKey;
    }
    // RN / RN-Web press events carry the modifier on nativeEvent, which is untyped, so read it behind a runtime guard.
    const nativeEvent = event?.nativeEvent;
    return typeof nativeEvent === 'object' && nativeEvent !== null && 'shiftKey' in nativeEvent && !!nativeEvent.shiftKey;
}

export default getShiftKeyFromEvent;
