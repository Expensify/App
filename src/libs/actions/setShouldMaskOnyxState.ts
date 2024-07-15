import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

export default function setShouldMaskOnyxState(shouldMask: boolean) {
    Onyx.set(ONYXKEYS.SHOULD_MASK_ONYX_STATE, shouldMask);
}
