import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import {useRoute} from '@react-navigation/native';
import noop from 'lodash/noop';

type CreateFlowTabSwitchGuardProps = {
    /** Whether the create flow's drafts hold user input */
    hasUnsavedChanges: boolean;
};

/**
 * Prompts "Discard changes?" before the user switches away from this tab of a create-expense flow while its draft holds user input.
 * Switching to a tab of another request type re-initializes the draft, so that wipe already is the discard.
 */
function CreateFlowTabSwitchGuard({hasUnsavedChanges}: CreateFlowTabSwitchGuardProps) {
    const route = useRoute();
    useRegisterTabSwitchGuard(route.name, () => hasUnsavedChanges, noop);
    return null;
}

export default CreateFlowTabSwitchGuard;
