import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ReactElement} from 'react';

import React from 'react';

import LinearGradientEmptyStateBackground from './LinearGradientEmptyStateBackground';

/**
 * Renders the global SVG definitions once. It is intentionally isolated from
 * the rest of the provider tree so that re-renders of the app do not rebuild
 * the shared <defs> and gradient elements.
 */
function SVGDefinitions(): ReactElement | null {
    return (
        <svg
            aria-hidden
            style={{height: 0, width: 0, position: 'absolute'}}
        >
            <defs>
                <LinearGradientEmptyStateBackground />
                <LinearGradientEmptyStateBackground isDarkTheme />
            </defs>
        </svg>
    );
}

/**
 * Provides global SVG definitions and helps avoid duplicated ids.
 * Duplicated ids in the <defs> cause rendering issues (like missing gradients).
 */
function SVGDefinitionsProvider({children}: ChildrenProps): ReactElement | null {
    return (
        <>
            <SVGDefinitions />
            {children}
        </>
    );
}

export default SVGDefinitionsProvider;
