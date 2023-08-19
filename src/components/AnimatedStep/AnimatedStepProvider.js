import React, {useState} from 'react';
import PropTypes from 'prop-types';
import AnimatedStepContext from './AnimatedStepContext';
import CONST from '../../CONST';

const propTypes = {
    children: PropTypes.node.isRequired,
};

function AnimatedStepProvider({children}) {
    const [animationDirection, setAnimationDirection] = useState(CONST.ANIMATION_DIRECTION.IN);

    return <AnimatedStepContext.Provider value={{animationDirection, setAnimationDirection}}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.propTypes = propTypes;
export default AnimatedStepProvider;
