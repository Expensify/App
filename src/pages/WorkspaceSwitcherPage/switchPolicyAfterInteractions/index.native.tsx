import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    InteractionManager.runAfterInteractions(() => {
        Navigation.navigateWithSwitchPolicyID({policyID: newPolicyID});
    });
}

export default switchPolicyAfterInteractions;
