/**
 * Asks before the user leaves the money request confirmation with an amount entered in it, when the confirmation opens
 * the flow. Going back from a confirmation reached from an earlier step keeps the draft, so that one doesn't ask.
 */
import type {OnInlineInputFocus} from '@components/MoneyRequestConfirmationFields/context';
import isTextInputRef from '@components/TextInput/BaseTextInput/isTextInputRef';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';

import focusComposerWithDelay from '@libs/focusComposerWithDelay';

import type {IOURequestType} from '@src/CONST';

import {useRef, useState} from 'react';

type UseConfirmationDiscardGuardParams = {
    /** Whether this confirmation opens the flow, so leaving it discards the draft */
    shouldConfirmDiscardingChanges: boolean;

    /** The draft's request type. A tab switch replaces the draft and remounts the amount field empty, while this confirmation can stay mounted under the hidden tab. */
    requestType: IOURequestType;

    /** The draft's `isAmountSet`, which the inline amount field sets once the user types a number */
    isAmountSet: boolean;

    /** Whether the expense is being submitted, which leaves the confirmation on purpose */
    isSubmitting: boolean;
};

type UseConfirmationDiscardGuardResult = {
    /** Takes what the amount field reports about input the draft doesn't hold */
    setHasUnsavedAmountInput: (hasUnsavedInput: boolean) => void;

    /** Lets a submit leave without asking. A submit can dismiss the confirmation before `isSubmitting` renders, so call it as the submit starts. */
    suppressDiscardPrompt: () => void;

    /** Whether the discard prompt covers the confirmation */
    isDiscardModalVisible: boolean;

    /** Takes the inline input that last took focus, so Cancel can put focus back in it */
    setLastFocusedInput: OnInlineInputFocus;
};

function useConfirmationDiscardGuard({shouldConfirmDiscardingChanges, requestType, isAmountSet, isSubmitting}: UseConfirmationDiscardGuardParams): UseConfirmationDiscardGuardResult {
    const [hasUnsavedAmountInput, setHasUnsavedAmountInput] = useState(false);
    const [prevRequestType, setPrevRequestType] = useState(requestType);
    if (prevRequestType !== requestType) {
        setPrevRequestType(requestType);
        setHasUnsavedAmountInput(false);
    }

    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);
    const getLastFocusedInputRef = useRef<(() => BaseTextInputRef | null) | undefined>(undefined);

    // The inputs stay read-only until the prompt's close commits, so focus has to wait for focusComposerWithDelay's delay.
    const restoreInputFocus = () => {
        focusComposerWithDelay(() => {
            const input = getLastFocusedInputRef.current?.() ?? null;
            return isTextInputRef(input) ? input : null;
        })(true);
    };

    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => shouldConfirmDiscardingChanges && !isSubmitting && (isAmountSet || hasUnsavedAmountInput),
        onCancel: restoreInputFocus,
        onVisibilityChange: setIsDiscardModalVisible,
    });

    const setLastFocusedInput: OnInlineInputFocus = (getInput) => {
        getLastFocusedInputRef.current = getInput;
    };

    return {setHasUnsavedAmountInput, suppressDiscardPrompt, isDiscardModalVisible, setLastFocusedInput};
}

export default useConfirmationDiscardGuard;
export type {UseConfirmationDiscardGuardParams};
