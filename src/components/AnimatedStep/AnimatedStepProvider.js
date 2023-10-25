import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import AnimatedStepContext from './AnimatedStepContext';
import CONST from '../../CONST';

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
