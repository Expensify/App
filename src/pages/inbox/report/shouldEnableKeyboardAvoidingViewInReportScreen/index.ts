import type ShouldEnableKeyboardAvoidingViewParams from './types';

const shouldEnableKeyboardAvoidingView = ({isInNarrowPaneModal, isTopMostReportId}: ShouldEnableKeyboardAvoidingViewParams) => {
    return isTopMostReportId || isInNarrowPaneModal;
};

export default shouldEnableKeyboardAvoidingView;
