import type {ResolveKeyboardBehavior} from './types';

const resolveKeyboardBehavior: ResolveKeyboardBehavior = (behavior) => {
    if (behavior === 'padding') {
        return 'height';
    }
    return behavior;
};

export default resolveKeyboardBehavior;
