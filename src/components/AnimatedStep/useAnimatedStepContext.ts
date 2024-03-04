import {useContext} from 'react';
import type {StepContext} from './AnimatedStepContext';
import AnimatedStepContext from './AnimatedStepContext';

function useAnimatedStepContext(): StepContext {
    const context = useContext(AnimatedStepContext);
    if (!context) {
        throw new Error('useAnimatedStepContext must be used within an AnimatedStepContextProvider');
    }
    return context;
}

export default useAnimatedStepContext;
