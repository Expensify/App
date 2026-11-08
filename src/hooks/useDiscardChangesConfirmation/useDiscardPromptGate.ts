/**
 * The checks that decide whether the "Discard changes?" prompt asks, shared by the web and native versions of the hook.
 */
import {isFlowDiscardPromptSuppressed, releaseFlowDiscardPromptSuppression} from '@libs/Navigation/helpers/discardPromptState';
import isNavigationInsideFlow from '@libs/Navigation/helpers/isNavigationInsideFlow';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import type UseDiscardChangesConfirmationOptions from './types';

type UseDiscardPromptGateParams = Pick<UseDiscardChangesConfirmationOptions, 'getHasUnsavedChanges' | 'shouldPromptWhenUnfocused'>;

function useDiscardPromptGate({getHasUnsavedChanges, shouldPromptWhenUnfocused = false}: UseDiscardPromptGateParams) {
    const route = useRoute();
    const navigation = useNavigation();

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    // The first screen of a flow (`shouldPromptWhenUnfocused`) is the exception: it keeps prompting while the flow's
    // other steps are open on top of it.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
        return () => {
            // The first screen of a flow stays open below the next step after it calls `suppressDiscardPrompt` and moves on.
            // Turn its prompt back on, so closing the RHP from the next step still asks.
            if (!shouldPromptWhenUnfocused) {
                return;
            }
            isSavingRef.current = false;
        };
    });
    useEffect(() => {
        if (!shouldPromptWhenUnfocused) {
            return undefined;
        }
        // Turn the prompt back on when a flow opens or closes, so a submit that muted the previous flow can't mute this one.
        releaseFlowDiscardPromptSuppression();
        return () => releaseFlowDiscardPromptSuppression();
    }, [shouldPromptWhenUnfocused]);

    // The first screen of a flow still stays quiet when the whole flow is covered, such as by another RHP or a fullscreen
    const isGuardActive = () => (shouldPromptWhenUnfocused ? (navigation.getParent()?.isFocused() ?? true) : isFocused);
    const isMuted = () => isSavingRef.current || (shouldPromptWhenUnfocused && isFlowDiscardPromptSuppressed());
    const hasUnsavedChanges = () => isGuardActive() && !isMuted() && getHasUnsavedChanges();

    // Some navigations remove the flow's first screen but keep the user in the flow, so they don't prompt
    const shouldPromptFor = (action: NavigationAction) => !shouldPromptWhenUnfocused || !isNavigationInsideFlow(action, route, navigation.getState());

    const suppressDiscardPrompt = (shouldSuppress = true) => {
        isSavingRef.current = shouldSuppress;
    };

    return {routeName: route.name, isFocused, hasUnsavedChanges, shouldPromptFor, suppressDiscardPrompt};
}

export default useDiscardPromptGate;
