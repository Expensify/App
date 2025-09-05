import type ShouldEnableKeyboardAvoidingViewParams from './types';

const shouldEnableKeyboardAvoidingView = ({isComposerFullSize}: ShouldEnableKeyboardAvoidingViewParams) => {
    return isComposerFullSize;
};

export default shouldEnableKeyboardAvoidingView;
