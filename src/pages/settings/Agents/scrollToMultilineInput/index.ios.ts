import type {ScrollWithKeyboard} from '@hooks/useKeyboardDrivenScroll/types';

function scrollToMultilineInput(scrollWithKeyboard: ScrollWithKeyboard, shouldScrollToMultilineInput: boolean, inputTopOffset: number) {
    if (!shouldScrollToMultilineInput) {
        return;
    }
    scrollWithKeyboard({offset: inputTopOffset});
}

export default scrollToMultilineInput;
