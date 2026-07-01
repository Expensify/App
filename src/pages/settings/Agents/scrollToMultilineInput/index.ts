import type {RefObject} from 'react';
import type {FormRef} from '@components/Form/types';

// This function is only needed on iOS where there is no auto scroll to the multiline text input on focus.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scrollToMultilineInput(formWrapperRef: RefObject<FormRef | null>, shouldScrollToMultilineInput: boolean) {}

export default scrollToMultilineInput;
