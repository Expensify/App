import React, {useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import TooltipSense from '@components/Tooltip/TooltipSense';

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
        if (!TooltipSense.isActive() || !isScreenBlurred) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFrozen(isScreenBlurred);
        }

        // When a tooltip is active, defer freezing by one frame so it can dismiss first.
        // Otherwise the frozen tree can't hide the tooltip portal rendered on <body>.
        const id = requestAnimationFrame(() => setFrozen(isScreenBlurred));
        return () => {
            cancelAnimationFrame(id);
        };
    }, [isScreenBlurred]);

    return <Freeze freeze={frozen}>{children}</Freeze>;
}

export default ScreenFreezeWrapper;
