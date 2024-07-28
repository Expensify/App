import type {MutableRefObject} from 'react';
import type {View} from 'react-native';

function nullCheckRef(ref: MutableRefObject<View | null>, nullRef: MutableRefObject<View | null>): MutableRefObject<View | null> {
    if (ref === null) {
        return nullRef;
    }
    return ref;
}

export default nullCheckRef;
