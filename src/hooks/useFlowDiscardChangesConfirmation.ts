/** Elect the earliest mounted step, including direct-linked steps, to guard a Settings or bank operation. */
import isActionInsideNamedFlow from '@libs/Navigation/helpers/isActionInsideNamedFlow';

import {useNavigation, useNavigationState, useRoute} from '@react-navigation/native';

import useDiscardChangesConfirmation from './useDiscardChangesConfirmation';

type FlowDiscardChangesOptions = {
    screenNames: readonly string[];
    getHasUnsavedChanges: () => boolean;
    onDiscard?: () => void | Promise<void>;
};

function useFlowDiscardChangesConfirmation({screenNames, getHasUnsavedChanges, onDiscard}: FlowDiscardChangesOptions) {
    const route = useRoute();
    const navigation = useNavigation();
    const ownerKey = useNavigationState((state) => state.routes.find((screen) => screenNames.includes(screen.name))?.key);

    return useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => ownerKey === route.key && getHasUnsavedChanges(),
        shouldPromptWhenUnfocused: true,
        isNavigationInsideFlow: (action) => isActionInsideNamedFlow(action, screenNames, navigation.getState()?.key),
        onConfirm: onDiscard,
        onTabSwitchDiscard: onDiscard,
    });
}

export default useFlowDiscardChangesConfirmation;
