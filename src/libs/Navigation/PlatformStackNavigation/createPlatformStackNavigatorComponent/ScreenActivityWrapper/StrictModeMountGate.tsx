import CONFIG from '@src/CONFIG';

import React, {StrictMode, useLayoutEffect, useState} from 'react';

type StrictModeMountGateProps = {
    children: React.ReactNode;
};

/**
 * React double-invokes effects only for content that mounts inside an already committed StrictMode fiber: the dev-only
 * traversal driving that cycle walks from the root and stops at the first newly placed fiber, so a StrictMode mounting
 * together with the screen is never visited. Committing StrictMode one commit ahead of the screen content puts every
 * child mount inside a committed StrictMode, which makes the qualification gate real.
 */
function StrictModeMountGate({children}: StrictModeMountGateProps) {
    const [canMountChildren, setCanMountChildren] = useState(false);
    useLayoutEffect(() => {
        // The extra commit this synchronous setState causes is the point of the gate (see the component comment).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCanMountChildren(true);
    }, []);
    return <StrictMode>{canMountChildren ? children : null}</StrictMode>;
}

/**
 * Production builds get the plain content because StrictMode does nothing there, and profiling sessions opt out of the
 * gate through USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV to keep double renders out of the measurements.
 */
function StrictModeMountGatePassThrough({children}: StrictModeMountGateProps) {
    return children;
}

const DevStrictModeMountGate = __DEV__ && CONFIG.USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV ? StrictModeMountGate : StrictModeMountGatePassThrough;

export default DevStrictModeMountGate;
