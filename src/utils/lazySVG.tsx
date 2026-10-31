import type {SvgProps} from 'react-native-svg';

import React, {lazy, Suspense} from 'react';

type SVGModule = {default: React.FC<SvgProps>};

const getFallbackModule = (): SVGModule => ({
    default: () => null,
});

/**
 * Splits an SVG into its own web chunk and returns a component that renders like a static SVG import.
 * It renders nothing until the chunk loads, and nothing at all if the chunk fails to load.
 * Web only: on native an .svg import resolves to an asset id, so native files keep static imports.
 */
function lazySVG(importSVG: () => Promise<SVGModule>): React.FC<SvgProps> {
    const LazySVGComponent = lazy(() => importSVG().catch(getFallbackModule));

    function LazySVG(props: SvgProps) {
        return (
            <Suspense fallback={null}>
                <LazySVGComponent {...props} />
            </Suspense>
        );
    }

    return LazySVG;
}

export default lazySVG;
