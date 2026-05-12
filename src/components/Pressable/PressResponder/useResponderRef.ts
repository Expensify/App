import {use} from 'react';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import mergeRefs from '@libs/mergeRefs';
import PressResponderContext from './PressResponderContext';

/** Single-purpose ref hook: merges the consumer's ref with any ancestor `<PressResponder>`'s ref. Kept separate from `usePressResponderProps` so React Compiler can verify the ref flow narrowly. */
function useResponderRef(consumerRef: PressableProps['ref']): PressableProps['ref'] {
    const responder = use(PressResponderContext);
    if (!responder) {
        return consumerRef;
    }
    responder.registerRef();
    return mergeRefs(consumerRef, responder.ref) as PressableProps['ref'];
}

export default useResponderRef;
