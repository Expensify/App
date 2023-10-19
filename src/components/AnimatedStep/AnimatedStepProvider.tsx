import React, {useState} from 'react';
import AnimatedStepContext, {AnimationDirection} from './AnimatedStepContext';
import CONST from '../../CONST';
import ChildrenProps from '../../types/utils/ChildrenProps';

function AnimatedStepProvider({children}: ChildrenProps): React.ReactNode {
    const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(CONST.ANIMATION_DIRECTION.IN);

    return <AnimatedStepContext.Provider value={{animationDirection, setAnimationDirection}}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.displayName = 'AnimatedStepProvider';
export default AnimatedStepProvider;
