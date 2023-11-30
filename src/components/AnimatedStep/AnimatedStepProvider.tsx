import React, {useMemo, useState} from 'react';
import CONST from '@src/CONST';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import AnimatedStepContext, {AnimationDirection} from './AnimatedStepContext';

function AnimatedStepProvider({children}: ChildrenProps): React.ReactNode {
    const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(CONST.ANIMATION_DIRECTION.IN);
    const contextValue = useMemo(() => ({animationDirection, setAnimationDirection}), [animationDirection, setAnimationDirection]);

    return <AnimatedStepContext.Provider value={contextValue}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.displayName = 'AnimatedStepProvider';
export default AnimatedStepProvider;
