import React from 'react';
import ChartFontsProvider from './ChartFontsProvider';

type ChartFontsBoundaryProps = {
    children: React.ReactNode;
};

/**
 * Re-mounts chart font context inside Skia overlay subtrees (e.g. cartesian renderOutside,
 * polar children) where React context does not propagate across the Skia boundary.
 */
function ChartFontsBoundary({children}: ChartFontsBoundaryProps) {
    return <ChartFontsProvider>{children}</ChartFontsProvider>;
}

export default ChartFontsBoundary;
