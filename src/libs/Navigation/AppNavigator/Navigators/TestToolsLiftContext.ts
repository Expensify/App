import type {CardAnimationContext} from '@react-navigation/stack';
import type {ContextType} from 'react';

import {createContext} from 'react';

type TestToolsLift = {
    /** Move the focused screen into the portal host above the required-2FA overlay. */
    shouldLift: boolean;

    /** Card animation of the root test-tools modal, captured before the nested stack replaces it. */
    cardAnimation: ContextType<typeof CardAnimationContext>;
};

const TestToolsLiftContext = createContext<TestToolsLift>({
    shouldLift: false,
    cardAnimation: undefined,
});

export default TestToolsLiftContext;
