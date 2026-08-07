import measureAnchor from '@components/Overlay/libs/measureAnchor';
import type {AnchorNode, AnchorRect} from '@components/Overlay/libs/measureAnchor';

import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';
import {Dimensions} from 'react-native';

import anchorBoxChanged from './shared';

function useDismissOnAnchorMove(anchor: AnchorNode | null, onDismiss: () => void, isActive: boolean): void {
    const stableDismiss = useCallbackRef(onDismiss);

    useEffect(() => {
        if (!isActive || anchor === null) {
            return undefined;
        }

        let cancelled = false;
        let dismissed = false;
        const dismissOnce = () => {
            if (dismissed) {
                return;
            }
            dismissed = true;
            stableDismiss();
        };

        let baseline: AnchorRect | null = null;
        measureAnchor(anchor).then(
            (rect) => {
                if (cancelled) {
                    return;
                }
                baseline = rect;
            },
            () => {},
        );

        const subscription = Dimensions.addEventListener('change', () => {
            measureAnchor(anchor).then(
                (next) => {
                    if (cancelled || baseline === null || next === null) {
                        return;
                    }
                    if (!anchorBoxChanged(next, baseline)) {
                        return;
                    }
                    dismissOnce();
                },
                () => {},
            );
        });

        return () => {
            cancelled = true;
            subscription.remove();
        };
    }, [anchor, isActive, stableDismiss]);
}

export default useDismissOnAnchorMove;
