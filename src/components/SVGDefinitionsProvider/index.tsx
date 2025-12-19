import type {ReactElement} from 'react';
import React from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import LinearGradientEmptyStateBackground from './LinearGradientEmptyStateBackground';

/**
 * Provides global SVG definitions and helps avoid duplicated ids.
 * Duplicated ids in the <defs> cause rendering issues (like missing gradients).
 */
function SVGDefinitionsProvider({children}: ChildrenProps): ReactElement | null {
    return (
        <>
            <svg
                aria-hidden
                style={{height: 0, width: 0, position: 'absolute'}}
            >
                <defs>
                    <LinearGradientEmptyStateBackground />
                    <LinearGradientEmptyStateBackground isDarkTheme />
                </defs>
            </svg>
            {children}
        </>
    );
}

export default SVGDefinitionsProvider;
