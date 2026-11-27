import {createContext} from 'react';

type SkeletonContextValue = {
    backgroundColor: string;
    foregroundColor: string;
    isForegroundLayer: boolean;
};

const SkeletonContext = createContext<SkeletonContextValue | null>(null);

export default SkeletonContext;
