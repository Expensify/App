import type ShouldEnableKeyboardAvoidingViewParams from './types';

const shouldEnableKeyboardAvoidingView = ({isInNarrowPaneModal, isTopMostReportId}: ShouldEnableKeyboardAvoidingViewParams) => {
    return isInNarrowPaneModal || isTopMostReportId;
};

export default shouldEnableKeyboardAvoidingView;
