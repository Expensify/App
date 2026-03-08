import type {RefObject} from 'react';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import type WindowDimensions from '@hooks/useWindowDimensions/types';

type ResponsiveLayoutProperties = WindowDimensions & {
    responsiveLayoutResults: Partial<ResponsiveLayoutResult>;
};

type FullScreenStateContextType = {
    /** Whether the application is currently in fullscreen mode. */
    isFullScreenRef: RefObject<boolean>;

    /** Window dimensions saved before entering fullscreen mode. */
    lockedWindowDimensionsRef: RefObject<ResponsiveLayoutProperties | null>;
};

type FullScreenActionsContextType = {
    /** Sets the locked window dimensions. */
    lockWindowDimensions: (newResponsiveLayoutResult: ResponsiveLayoutProperties) => void;

    /** Clears the locked window dimensions. */
    unlockWindowDimensions: () => void;
};

export type {ResponsiveLayoutProperties, FullScreenStateContextType, FullScreenActionsContextType};
