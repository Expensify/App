import useLazySvg from '@hooks/useLazySvg';
import type {LazySvgLoader} from '@hooks/useLazySvg';

import React from 'react';

import type ImageSVGProps from './ImageSVG/types';

import PlaceholderIcon from './Icon/PlaceholderIcon';
import ImageSVG from './ImageSVG';

type LazyImageSVGProps = Omit<ImageSVGProps, 'src'> & {
    /** Dynamic import of the SVG. Must be a stable module-level function, the loaded component is cached by its identity. */
    loader: LazySvgLoader | undefined;
};

/**
 * ImageSVG for decorative backgrounds that are loaded on demand, so they stay out of the main bundle.
 * Renders an empty box of the same size until the SVG is ready, and keeps that box if the chunk fails to load.
 */
function LazyImageSVG({loader, ...props}: LazyImageSVGProps) {
    const Svg = useLazySvg(loader);

    if (!loader) {
        return null;
    }

    return (
        <ImageSVG
            src={Svg ?? PlaceholderIcon}
            {...props}
        />
    );
}

LazyImageSVG.displayName = 'LazyImageSVG';

export default LazyImageSVG;
