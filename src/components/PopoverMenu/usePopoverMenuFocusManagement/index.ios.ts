import type {UsePopoverMenuFocusManagementParams} from './types';

import useNativePopoverMenuFocusManagement from './useNativePopoverMenuFocusManagement';

function usePopoverMenuFocusManagement(params: UsePopoverMenuFocusManagementParams) {
    return useNativePopoverMenuFocusManagement(params, true);
}

export default usePopoverMenuFocusManagement;
