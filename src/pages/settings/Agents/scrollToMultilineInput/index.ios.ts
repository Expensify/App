import type {FormRef} from '@components/Form/types';

import type {RefObject} from 'react';

function scrollToMultilineInput(formRef: RefObject<FormRef | null>, shouldScrollToMultilineInput: boolean, inputTopOffset: number) {
    if (!shouldScrollToMultilineInput || !formRef.current) {
        return;
    }
    formRef.current.scrollTo(inputTopOffset);
}

export default scrollToMultilineInput;
