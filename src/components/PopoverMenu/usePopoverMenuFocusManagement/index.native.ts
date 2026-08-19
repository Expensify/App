import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import type {UsePopoverMenuFocusManagementParams} from './types';

import useNativePopoverMenuFocusManagement from './useNativePopoverMenuFocusManagement';

function usePopoverMenuFocusManagement(params: UsePopoverMenuFocusManagementParams) {
    return useNativePopoverMenuFocusManagement(params, getPlatform() === CONST.PLATFORM.IOS);
}

export default usePopoverMenuFocusManagement;
