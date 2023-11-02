import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import CONST from '@src/CONST';
import AnimatedStepContext from './AnimatedStepContext';

const propTypes = {
    children: PropTypes.node.isRequired,
};

function AnimatedStepProvider({children}) {
    const [animationDirection, setAnimationDirection] = useState(CONST.ANIMATION_DIRECTION.IN);
    const contextValue = useMemo(() => ({animationDirection, setAnimationDirection}), [animationDirection, setAnimationDirection]);

    return <AnimatedStepContext.Provider value={contextValue}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.propTypes = propTypes;
export default AnimatedStepProvider;
