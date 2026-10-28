import useCreateFlowDiscardGuard from '@hooks/useCreateFlowDiscardGuard';

import {useNavigation, useRoute} from '@react-navigation/native';

type CreateFlowRootDiscardGuardProps = {
    /** Side effects that must only run once the user confirms leaving, right before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

/**
 * Guards a create-flow step that dropping a receipt opens as the first screen of the flow, with no start page below it to guard the flow.
 * Anywhere else in the flow, the screen below already guards it, so this one stays out of the way.
 */
function CreateFlowRootDiscardGuard({onBeforeClose}: CreateFlowRootDiscardGuardProps) {
    const navigation = useNavigation();
    const route = useRoute();

    useCreateFlowDiscardGuard({
        isEnabled: true,
        getIsFlowRoot: () => navigation.getState()?.routes.at(0)?.key === route.key,
        onBeforeClose,
    });

    return null;
}

export default CreateFlowRootDiscardGuard;
