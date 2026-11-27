/** Each loader owns its coordinate space; separate list rows need no common clock. */
import {createContext} from 'react';

import type {SkeletonAnimation} from './types';

type SkeletonContextValue = {
    width: number;
    height: number;
    backgroundColor: string;
    foregroundColor: string;
    isAnimating: boolean;
    animation: SkeletonAnimation;
    speed: number;
    isForegroundLayer: boolean;
};

const SkeletonContext = createContext<SkeletonContextValue | null>(null);

export default SkeletonContext;
