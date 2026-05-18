import type {RefObject} from 'react';
import type {ComposerRef} from '@components/Composer/types';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;

const updateNativeSelectionValue = (composerRef: RefObject<ComposerRef | null>, start: number, end: number) => {
    if (!isIOSNative) {
        return;
    }

    // Ensure that native selection value is set imperatively after all state changes are effective
    requestIdleCallback(() => {
        // note: this implementation is only available on non-web RN, thus the wrapping
        // 'if' block contains a redundant (since the ref is only used on iOS) platform check
        composerRef.current?.setSelection(start, end);
    });
};

const ReportActionComposeUtils = {
    updateNativeSelectionValue,
};

export default ReportActionComposeUtils;
