/**
 * Guards a step that is sometimes the first screen of the flow. When the user drops a receipt onto a report or Home, Confirmation
 * or Participants opens with no start page below it. Anywhere else, the screen below already guards the flow, so this does nothing.
 */
import useCreateFlowDiscardGuard from '@hooks/useCreateFlowDiscardGuard';

import {useNavigation, useRoute} from '@react-navigation/native';

type CreateFlowRootDiscardGuardProps = {
    /** Runs after the user picks Discard, before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

function CreateFlowRootDiscardGuard({onBeforeClose}: CreateFlowRootDiscardGuardProps) {
    const navigation = useNavigation();
    const route = useRoute();

    useCreateFlowDiscardGuard({
        isEnabled: true,
        shouldPrompt: () => navigation.getState()?.routes.at(0)?.key === route.key,
        onBeforeClose,
    });

    return null;
}

export default CreateFlowRootDiscardGuard;
