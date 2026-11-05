/**
 * Asks "Discard changes?" before the user switches to another tab while the draft has their input.
 * Switching tabs already clears the draft, so Discard has nothing extra to do.
 */
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import {useRoute} from '@react-navigation/native';
import noop from 'lodash/noop';

type CreateFlowTabSwitchGuardProps = {
    /** Whether the flow's drafts have user input */
    hasUnsavedChanges: boolean;
};

function CreateFlowTabSwitchGuard({hasUnsavedChanges}: CreateFlowTabSwitchGuardProps) {
    const route = useRoute();
    useRegisterTabSwitchGuard(route.name, () => hasUnsavedChanges, noop);
    return null;
}

export default CreateFlowTabSwitchGuard;
