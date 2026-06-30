import {use} from 'react';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import mergeRefs from '@libs/mergeRefs';
import PressResponderContext from './PressResponderContext';

/** Merges the consumer's ref with any ancestor `<PressResponder>`'s ref. Separate from `usePressResponderProps` so React Compiler can verify ref flow narrowly. */
function useResponderRef(consumerRef: PressableProps['ref']): PressableProps['ref'] {
    const responder = use(PressResponderContext);
    if (!responder) {
        return consumerRef;
    }
    return mergeRefs(consumerRef, responder.ref) as PressableProps['ref'];
}

export default useResponderRef;
