/**
 * The checks that decide whether the "Discard changes?" prompt asks, shared by the web and native versions of the hook.
 */
import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import {useRef} from 'react';

import type UseDiscardChangesConfirmationOptions from './types';

type UseDiscardPromptGateParams = Pick<UseDiscardChangesConfirmationOptions, 'getHasUnsavedChanges'>;

function useDiscardPromptGate({getHasUnsavedChanges}: UseDiscardPromptGateParams) {
    const route = useRoute();

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
    });
    const hasUnsavedChanges = () => isFocused && !isSavingRef.current && getHasUnsavedChanges();

    const suppressDiscardPrompt = (shouldSuppress = true) => {
        isSavingRef.current = shouldSuppress;
    };

    return {routeName: route.name, isFocused, hasUnsavedChanges, suppressDiscardPrompt};
}

export default useDiscardPromptGate;
