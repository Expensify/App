import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';
import {Dimensions} from 'react-native';

function useDismissOnAnchorMove(anchor: AnchorNode | null, onDismiss: () => void, isActive: boolean): void {
    const stableDismiss = useCallbackRef(onDismiss);

    useEffect(() => {
        if (!isActive || anchor === null) {
            return undefined;
        }

        const subscription = Dimensions.addEventListener('change', () => stableDismiss());
        return () => subscription.remove();
    }, [anchor, isActive, stableDismiss]);
}

export default useDismissOnAnchorMove;
