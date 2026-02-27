import React, {useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFrozen(isScreenBlurred);
    }, [isScreenBlurred]);

    return <Freeze freeze={frozen}>{children}</Freeze>;
}

export default ScreenFreezeWrapper;
