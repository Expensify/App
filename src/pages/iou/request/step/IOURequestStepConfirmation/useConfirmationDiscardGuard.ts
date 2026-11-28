/**
 * Asks before the user leaves the money request confirmation with an amount entered in it, when the confirmation opens
 * the flow. Going back from a confirmation reached from an earlier step keeps the draft, so that one doesn't ask.
 */
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';

import type {IOURequestType} from '@src/CONST';

import {useState} from 'react';

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
};

function useConfirmationDiscardGuard({shouldConfirmDiscardingChanges, requestType, isAmountSet, isSubmitting}: UseConfirmationDiscardGuardParams): UseConfirmationDiscardGuardResult {
    const [hasUnsavedAmountInput, setHasUnsavedAmountInput] = useState(false);
    const [prevRequestType, setPrevRequestType] = useState(requestType);
    if (prevRequestType !== requestType) {
        setPrevRequestType(requestType);
        setHasUnsavedAmountInput(false);
    }

    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);
    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => shouldConfirmDiscardingChanges && !isSubmitting && (isAmountSet || hasUnsavedAmountInput),
        onVisibilityChange: setIsDiscardModalVisible,
    });

    return {setHasUnsavedAmountInput, suppressDiscardPrompt, isDiscardModalVisible};
}

export default useConfirmationDiscardGuard;
export type {UseConfirmationDiscardGuardParams};
