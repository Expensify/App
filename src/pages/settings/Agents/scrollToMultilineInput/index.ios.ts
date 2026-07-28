import type {FormRef} from '@components/Form/types';

import type {RefObject} from 'react';

function scrollToMultilineInput(formWrapperRef: RefObject<FormRef | null>, shouldScrollToMultilineInput: boolean) {
    if (!shouldScrollToMultilineInput || !formWrapperRef.current) {
        return;
    }
    formWrapperRef.current.scrollToEnd();
}

export default scrollToMultilineInput;
