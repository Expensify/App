import {useImperativeHandle} from 'react';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import type {ComposerRef} from './types';

function useComposerHandle(ref: React.Ref<ComposerRef> | undefined, textInputRef: React.RefObject<AnimatedMarkdownTextInputRef | null>, additionalMethods: Partial<ComposerRef>) {
    useImperativeHandle(ref, () => {
        const textInput = textInputRef.current;
        if (!textInput) {
            throw new Error('textInput is not available. This should never happen and indicates a developer error.');
        }

        return getComposerHandle(textInput, additionalMethods);
    }, [additionalMethods, textInputRef]);
}

function getComposerHandle(textInput: AnimatedMarkdownTextInputRef | null, additionalMethods: Partial<ComposerRef>) {
    return {
        ...textInput,
        blur: () => textInput?.blur(),
        focus: () => textInput?.focus(),
        get scrollTop() {
            return textInput?.scrollTop;
        },
        ...additionalMethods,
    } as ComposerRef;
}

export default useComposerHandle;
export {getComposerHandle};
