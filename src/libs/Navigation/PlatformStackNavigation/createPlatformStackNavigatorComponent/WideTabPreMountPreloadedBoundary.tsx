import {IsHiddenWideTabPreMountContext} from '@hooks/useIsHiddenWideTabPreMount';

import type {ReactNode} from 'react';

import React from 'react';

type WideTabPreMountPreloadedBoundaryProps = {
    /** Whether the screen is a wide submit pre-mount still hidden under the current screen */
    isHiddenPreMount: boolean;

    /** Screen content */
    children: ReactNode;
};

/**
 * Tells a screen that it is a hidden wide submit pre-mount, so it holds the work that assumes the user is looking
 * (e.g. marking the report read) until the reveal. Always rendered, so the reveal keeps the same tree.
 */
function WideTabPreMountPreloadedBoundary({isHiddenPreMount, children}: WideTabPreMountPreloadedBoundaryProps) {
    return <IsHiddenWideTabPreMountContext.Provider value={isHiddenPreMount}>{children}</IsHiddenWideTabPreMountContext.Provider>;
}

export default WideTabPreMountPreloadedBoundary;
