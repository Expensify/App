import {useContext} from 'react';
import AnimatedStepContext from './AnimatedStepContext';

function useAnimatedStepContext() {
    const context = useContext(AnimatedStepContext);
    if (!context) {
        throw new Error('useAnimatedStepContext must be used within an AnimatedStepContextProvider');
    }
    return context;
}

export default useAnimatedStepContext;
