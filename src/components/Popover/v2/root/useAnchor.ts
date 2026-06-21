import type {AnchorRefCallback} from '@components/Overlay/hooks/useAnchoredOpener';
import {usePopover} from './state';

function useAnchor(): AnchorRefCallback {
    return usePopover('useAnchor').actions.setCustomAnchor;
}

export default useAnchor;
export type {AnchorRefCallback};
