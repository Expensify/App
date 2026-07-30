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

        // Dismiss only on a portrait<->landscape flip; the keyboard shrinks height without flipping, so it's ignored.
        const initial = Dimensions.get('window');
        let wasPortrait = initial.height >= initial.width;
        const subscription = Dimensions.addEventListener('change', ({window}) => {
            const isPortrait = window.height >= window.width;
            if (isPortrait === wasPortrait) {
                return;
            }
            wasPortrait = isPortrait;
            stableDismiss();
        });
        return () => subscription.remove();
    }, [anchor, isActive, stableDismiss]);
}

export default useDismissOnAnchorMove;
