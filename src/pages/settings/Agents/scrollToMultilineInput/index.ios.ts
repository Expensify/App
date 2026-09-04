import type {FormRef} from '@components/Form/types';

import type {RefObject} from 'react';

function scrollToMultilineInput(formWrapperRef: RefObject<FormRef | null>, shouldScrollToMultilineInput: boolean, inputTopOffset: number) {
    if (!shouldScrollToMultilineInput || !formWrapperRef.current) {
        return;
    }
    formWrapperRef.current.scrollTo(inputTopOffset);
}

export default scrollToMultilineInput;
