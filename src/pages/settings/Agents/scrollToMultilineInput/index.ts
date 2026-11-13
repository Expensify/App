import type {ScrollWithKeyboard} from '@hooks/useKeyboardDrivenScroll/types';

// This function is only needed on iOS where there is no auto scroll to the multiline text input on focus.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scrollToMultilineInput(scrollWithKeyboard: ScrollWithKeyboard, shouldScrollToMultilineInput: boolean, inputTopOffset: number) {}

export default scrollToMultilineInput;
