import React, {useLayoutEffect, useRef, useState} from 'react';
import {Freeze} from 'react-freeze';
import TooltipSense from '@components/Tooltip/TooltipSense';
import {areAllModalsHidden} from '@userActions/Modal';
import ScreenFreezeContext from './ScreenFreezeContext';
import type ScreenFreezeWrapperProps from './types';

function ScreenFreezeWrapper({isScreenBlurred, children}: ScreenFreezeWrapperProps) {
    const [frozen, setFrozen] = useState(false);
    const freezeDeferCountRef = useRef(0);

    const registerFreezeDefer = () => {
        freezeDeferCountRef.current++;
        return () => {
            freezeDeferCountRef.current--;
        };
    };

    const contextValue = {registerFreezeDefer};

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        // When unfreezing, always apply immediately so the screen is visible right away.
        if (!isScreenBlurred) {
            // Synchronous unfreeze is intentional; the early return prevents infinite loops since
            // isScreenBlurred is the only dependency and won't change as a result of this setState.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFrozen(false);
            return;
        }

        // When there are active freeze defers (e.g. keyboard shortcuts that need to unsubscribe),
        // or when a modal/tooltip is still open, defer the freezing by one frame.
        if (freezeDeferCountRef.current > 0 || TooltipSense.isActive() || !areAllModalsHidden()) {
            const id = requestAnimationFrame(() => setFrozen(isScreenBlurred));
            return () => {
                cancelAnimationFrame(id);
            };
        }

        // No blockers or overlays — freeze immediately.
        // isScreenBlurred is the only dependency and setFrozen(true) won't trigger further isScreenBlurred changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFrozen(isScreenBlurred);
    }, [isScreenBlurred]);

    return (
        <ScreenFreezeContext.Provider value={contextValue}>
            <Freeze freeze={frozen}>{children}</Freeze>
        </ScreenFreezeContext.Provider>
    );
}

export default ScreenFreezeWrapper;
