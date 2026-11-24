import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {useRef, useState} from 'react';

import usePopoverPosition from './usePopoverPosition';

type AnchorElement = ComponentRef<typeof View> | HTMLDivElement;

/** Measures the trigger in the window, then shows the popover at its measured position. */
function useAnchoredPopoverOpener<TAnchor extends AnchorElement = ComponentRef<typeof View>>(anchorAlignment: AnchorAlignment, showPopover: () => void) {
    const {calculatePopoverPosition} = usePopoverPosition();

    const anchorRef = useRef<TAnchor | null>(null);
    const isOpeningRef = useRef(false);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({
        horizontal: 0,
        vertical: 0,
    });

    const openPopover = () => {
        // The popover only counts as open once the measurement resolves, so a second press before then must not start another one.
        if (isOpeningRef.current) {
            return;
        }
        isOpeningRef.current = true;
        calculatePopoverPosition(anchorRef, anchorAlignment)
            .then(({horizontal, vertical}) => {
                setAnchorPosition({horizontal, vertical});
                showPopover();
            })
            .finally(() => {
                isOpeningRef.current = false;
            });
    };

    return {anchorRef, anchorPosition, openPopover};
}

export default useAnchoredPopoverOpener;
