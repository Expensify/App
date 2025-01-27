import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined, setActiveWorkspaceID: () => void) {
    InteractionManager.runAfterInteractions(() => {
        setActiveWorkspaceID();
        Navigation.navigateWithSwitchPolicyID({policyID: newPolicyID});
    });
}

export default switchPolicyAfterInteractions;
