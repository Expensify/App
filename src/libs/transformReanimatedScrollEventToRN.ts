import type {NativeMethods, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {ReanimatedScrollEvent} from 'react-native-reanimated/lib/typescript/hook/commonTypes';

const NOOP_TARGET: NativeMethods = {
    measure: () => {},
    measureInWindow: () => {},
    measureLayout: () => {},
    setNativeProps: () => {},
    focus: () => {},
    blur: () => {},
};

function transformReanimatedScrollEventToRN(e: ReanimatedScrollEvent): NativeSyntheticEvent<NativeScrollEvent> {
    const rnEvent: NativeSyntheticEvent<NativeScrollEvent> = {
        nativeEvent: e,
        currentTarget: NOOP_TARGET,
        target: NOOP_TARGET,
        type: 'scroll',
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        timeStamp: Date.now(),
        persist: () => {},
        isPropagationStopped: () => false,
        stopPropagation: () => {},
        preventDefault: () => {},
        isDefaultPrevented: () => false,
    };

    return rnEvent;
}

export default transformReanimatedScrollEventToRN;
