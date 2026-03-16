import React, {useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import TooltipSense from '@components/Tooltip/TooltipSense';
import {areAllModalsHidden} from '@userActions/Modal';

type ScreenFreezeWrapperProps = {
    /** Whether the screen is not currently visible to the user */
    isScreenBlurred: boolean;

    /** The screen content to freeze when blurred */
    children: React.ReactNode;
};

function ScreenFreezeWrapper({isScreenBlurred, children}: ScreenFreezeWrapperProps) {
    const [frozen, setFrozen] = useState(false);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        // When no modal or tooltip is active, freeze/unfreeze immediately.
        if (!TooltipSense.isActive() && areAllModalsHidden()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFrozen(isScreenBlurred);
            return;
        }

        // When unfreezing, always apply immediately so the screen is visible right away.
        if (!isScreenBlurred) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFrozen(false);
            return;
        }

        // A modal or tooltip is still open. Defer freezing by one frame so it can dismiss
        // before the tree is suspended.
        const id = requestAnimationFrame(() => setFrozen(isScreenBlurred));
        return () => {
            cancelAnimationFrame(id);
        };
    }, [isScreenBlurred]);

    return <Freeze freeze={frozen}>{children}</Freeze>;
}

export default ScreenFreezeWrapper;
