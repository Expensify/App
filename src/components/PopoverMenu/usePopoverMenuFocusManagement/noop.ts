import type {UsePopoverMenuFocusManagementParams, UsePopoverMenuFocusManagementResult} from './types';

const handleModalHide = () => {};
const prepareForSelection = () => false;
const requestCloseAfterFocusPolicyCommit = () => {};

function usePopoverMenuFocusManagement({restoreFocusType, shouldEnableNewFocusManagement}: UsePopoverMenuFocusManagementParams): UsePopoverMenuFocusManagementResult {
    return {
        effectiveRestoreFocusType: restoreFocusType,
        handleModalHide,
        prepareForSelection,
        requestCloseAfterFocusPolicyCommit,
        shouldUseNewFocusManagement: !!shouldEnableNewFocusManagement,
    };
}

export default usePopoverMenuFocusManagement;
